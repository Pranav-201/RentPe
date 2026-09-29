import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Cart from "../models/Cart.js";
import Inventory from "../models/Inventory.js";
import { getPaginationParams } from "../utils/pagination.js";

export async function createOrder(req, res) {
  try {
    const { shippingAddress, paymentMethod, cartItemId } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate("items");
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

    const orderItems = [];
    let totalPrice = 0;
    let discountPrice = 0;

    for (const cartItem of itemsToProcess) {
      const productId = cartItem.product?._id || cartItem.product;
      const inventory = await Inventory.findOne({ product: productId });

      if (!inventory || inventory.available < cartItem.quantity) {
        return res.badRequest({
          error: `Insufficient inventory for selected product`
        });
      }

      const orderItem = new OrderItem({
        product: productId,
        quantity: cartItem.quantity,
        price: cartItem.price,
        discountPrice: cartItem.discountPrice || 0
      });

      await orderItem.save();
      orderItems.push(orderItem._id);

      totalPrice += cartItem.total || (cartItem.price * cartItem.quantity);
      discountPrice += cartItem.discountTotal || ((cartItem.discountPrice || 0) * cartItem.quantity);

      inventory.reserved += cartItem.quantity;
      await inventory.save();
    }

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalPrice,
      discountPrice,
      finalPrice: Math.max(0, totalPrice - discountPrice),
      paymentMethod,
      paymentStatus: "pending"
    });

    await order.save();

    // Remove processed items from cart
    const processedIds = itemsToProcess.map((i) => i._id.toString());
    cart.items = cart.items.filter(
      (item) => !processedIds.includes(item._id.toString())
    );
    await CartItem.deleteMany({ _id: { $in: processedIds } });
    await cart.save();
    await cart.calculateTotals();

    res.created({
      message: "Order created successfully",
      order
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function getOrders(req, res) {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    let filter = { user: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate({
        path: "items",
        populate: { path: "product" }
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
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate({
      path: "items",
      populate: { path: "product" }
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

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.notFound({ error: "Order not found" });
    }

    res.ok({
      message: "Order status updated",
      order
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

    if (order.user.toString() !== req.user._id.toString()) {
      return res.forbidden({ error: "Not authorized" });
    }

    if (order.status !== "pending" && order.status !== "confirmed") {
      return res.badRequest({
        error: "Order cannot be cancelled at this status"
      });
    }

    for (const item of order.items) {
      const inventory = await Inventory.findOne({ product: item.product });
      if (inventory) {
        inventory.reserved -= item.quantity;
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
