import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import { getPaginationParams } from "../utils/pagination.js";

export async function createOrder(req, res) {
  try {
    const {
      shippingAddress,
      paymentMethod = "Cash/UPI on Pickup",
      cartItemId,
      productId,
      quantity = 1,
      message,
      days = 1
    } = req.body;

    const orderItems = [];
    let totalPrice = 0;
    let discountPrice = 0;
    const initialMessage = message || "Hi! I would like to rent this item. Is it available?";

    // Case 1: Direct Product Rental Request (e.g. from Product page / Message Owner)
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.notFound({ error: "Product not found" });
      }

      const inventory = await Inventory.findOne({ product: productId });
      const qty = Number(days || quantity || 1);
      const effectivePrice = product.discountPrice || product.price;

      const orderItem = new OrderItem({
        product: productId,
        quantity: qty,
        price: product.price,
        discountPrice: product.discountPrice || 0,
        total: effectivePrice * qty,
        discountTotal: (product.discountPrice ? (product.price - product.discountPrice) : 0) * qty
      });

      await orderItem.save();
      orderItems.push(orderItem._id);

      totalPrice = effectivePrice * qty;
      discountPrice = (product.discountPrice ? (product.price - product.discountPrice) : 0) * qty;

      if (inventory && inventory.available >= 1) {
        inventory.reserved = (inventory.reserved || 0) + 1;
        await inventory.save();
      }
    } else {
      // Case 2: From Cart
      const cart = await Cart.findOne({ user: req.user._id }).populate({
        path: "items",
        populate: { path: "product" }
      });

      if (!cart || cart.items.length === 0) {
        return res.badRequest({ error: "Cart is empty" });
      }

      let itemsToProcess = [];
      if (cartItemId) {
        const selectedItem = cart.items.find(
          (item) => item._id.toString() === cartItemId.toString()
        );
        if (!selectedItem) {
          return res.notFound({ error: "Selected item not found in cart" });
        }
        itemsToProcess = [selectedItem];
      } else {
        itemsToProcess = cart.items;
      }

      for (const cartItem of itemsToProcess) {
        const prodId = cartItem.product?._id || cartItem.product;
        const inventory = await Inventory.findOne({ product: prodId });

        const orderItem = new OrderItem({
          product: prodId,
          quantity: cartItem.quantity,
          price: cartItem.price,
          discountPrice: cartItem.discountPrice || 0,
          total: cartItem.total || (cartItem.price * cartItem.quantity),
          discountTotal: cartItem.discountTotal || 0
        });

        await orderItem.save();
        orderItems.push(orderItem._id);

        totalPrice += cartItem.total || (cartItem.price * cartItem.quantity);
        discountPrice += cartItem.discountTotal || ((cartItem.discountPrice || 0) * cartItem.quantity);

        if (inventory) {
          inventory.reserved = (inventory.reserved || 0) + cartItem.quantity;
          await inventory.save();
        }
      }

      // Remove processed items from cart
      const processedIds = itemsToProcess.map((i) => i._id.toString());
      cart.items = cart.items.filter(
        (item) => !processedIds.includes(item._id.toString())
      );
      await CartItem.deleteMany({ _id: { $in: processedIds } });
      await cart.save();
      await cart.calculateTotals();
    }

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = new Order({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress: shippingAddress || req.user.address,
      totalPrice,
      discountPrice,
      finalPrice: Math.max(0, totalPrice),
      paymentMethod,
      paymentStatus: "pending",
      status: "pending",
      notes: initialMessage,
      messages: [
        {
          sender: req.user._id,
          senderName: req.user.name || "Customer",
          text: initialMessage,
          createdAt: new Date()
        }
      ]
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone collegeName collegeId avatar")
      .populate({
        path: "items",
        populate: {
          path: "product",
          populate: [
            { path: "owner", select: "name email phone collegeName collegeId avatar" },
            { path: "createdBy", select: "name email phone collegeName collegeId avatar" }
          ]
        }
      });

    res.created({
      message: "Rental request sent to owner successfully",
      order: populatedOrder
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function getOrders(req, res) {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, type } = req.query;

    let filter = {};

    if (req.user.role === "admin") {
      if (status) filter.status = status;
    } else if (type === "owner") {
      // Find products owned or created by user
      const userProducts = await Product.find({
        $or: [{ owner: req.user._id }, { createdBy: req.user._id }]
      }).select("_id");
      const userProductIds = userProducts.map((p) => p._id);

      const orderItems = await OrderItem.find({
        product: { $in: userProductIds }
      }).select("_id");
      const orderItemIds = orderItems.map((oi) => oi._id);

      filter = { items: { $in: orderItemIds } };
      if (status) filter.status = status;
    } else {
      // Normal customer orders OR all requests related to this user
      filter = { user: req.user._id };
      if (status) filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("user", "name email phone collegeName collegeId avatar")
      .populate({
        path: "items",
        populate: {
          path: "product",
          populate: [
            { path: "owner", select: "name email phone collegeName collegeId avatar" },
            { path: "createdBy", select: "name email phone collegeName collegeId avatar" }
          ]
        }
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.ok({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone collegeName collegeId avatar")
      .populate({
        path: "items",
        populate: {
          path: "product",
          populate: [
            { path: "owner", select: "name email phone collegeName collegeId avatar" },
            { path: "createdBy", select: "name email phone collegeName collegeId avatar" }
          ]
        }
      });

    if (!order) {
      return res.notFound({ error: "Order not found" });
    }

    res.ok({ order });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id).populate("user");
    if (!order) {
      return res.notFound({ error: "Order not found" });
    }

    if (status) {
      order.status = status;
      if (status === "accepted") {
        order.messages.push({
          sender: req.user._id,
          senderName: req.user.name || "Owner",
          text: "✅ Request Accepted! Let's chat to finalize pickup timing and campus location.",
          createdAt: new Date()
        });
      } else if (status === "declined") {
        order.messages.push({
          sender: req.user._id,
          senderName: req.user.name || "Owner",
          text: "❌ Request Declined. This item is currently unavailable.",
          createdAt: new Date()
        });
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone collegeName collegeId avatar")
      .populate({
        path: "items",
        populate: {
          path: "product",
          populate: [
            { path: "owner", select: "name email phone collegeName collegeId avatar" },
            { path: "createdBy", select: "name email phone collegeName collegeId avatar" }
          ]
        }
      });

    res.ok({
      message: `Order status updated to ${status || paymentStatus}`,
      order: updatedOrder
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function addOrderMessage(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.badRequest({ error: "Message text is required" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.notFound({ error: "Order not found" });
    }

    const newMessage = {
      sender: req.user._id,
      senderName: req.user.name || "User",
      text: text.trim(),
      createdAt: new Date()
    };

    order.messages.push(newMessage);
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone collegeName collegeId avatar")
      .populate({
        path: "items",
        populate: {
          path: "product",
          populate: [
            { path: "owner", select: "name email phone collegeName collegeId avatar" },
            { path: "createdBy", select: "name email phone collegeName collegeId avatar" }
          ]
        }
      });

    res.ok({
      message: "Message sent successfully",
      order: updatedOrder
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function cancelOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id).populate("items");
    if (!order) {
      return res.notFound({ error: "Order not found" });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.forbidden({ error: "Not authorized" });
    }

    for (const item of order.items) {
      const inventory = await Inventory.findOne({ product: item.product });
      if (inventory && inventory.reserved > 0) {
        inventory.reserved = Math.max(0, inventory.reserved - (item.quantity || 1));
        await inventory.save();
      }
    }

    order.status = "cancelled";
    await order.save();

    res.ok({
      message: "Order cancelled successfully",
      order
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}
