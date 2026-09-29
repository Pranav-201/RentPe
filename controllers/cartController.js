import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";

async function getPopulatedCart(userId) {
  return await Cart.findOne({ user: userId }).populate({
    path: "items",
    populate: { path: "product" }
  });
}

export async function getCart(req, res) {
  try {
    let cart = await getPopulatedCart(req.user._id);

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
      cart = await getPopulatedCart(req.user._id);
    }

    res.ok({ cart });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function addCartItem(req, res) {
  try {
    const { product: productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.notFound({ error: "Product not found" });
    }

    const inventory = await Inventory.findOne({ product: productId });
    if (!inventory || inventory.available < quantity) {
      return res.badRequest({
        error: "Insufficient inventory"
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id });
    }

    const existingItem = await CartItem.findOne({
      _id: { $in: cart.items },
      product: productId
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.total = (existingItem.price || 0) * existingItem.quantity;
      existingItem.discountTotal = (existingItem.discountPrice || 0) * existingItem.quantity;
      await existingItem.save();
    } else {
      const itemPrice = product.pricePerDay !== undefined && product.pricePerDay !== null ? product.pricePerDay : (product.price || 0);
      const itemDiscount = product.discountPrice || 0;
      const cartItem = new CartItem({
        product: productId,
        quantity,
        price: itemPrice,
        discountPrice: itemDiscount,
        total: itemPrice * quantity,
        discountTotal: itemDiscount * quantity
      });
      await cartItem.save();
      cart.items.push(cartItem._id);
    }

    await cart.save();
    await cart.calculateTotals();

    const populatedCart = await getPopulatedCart(req.user._id);

    res.created({
      message: "Item added to cart",
      cart: populatedCart
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function updateCartItem(req, res) {
  try {
    const { quantity } = req.body;

    // Use findByIdAndUpdate to bypass Mongoose validation (avoids "product is required" error)
    const cartItem = await CartItem.findByIdAndUpdate(
      req.params.id,
      [
        {
          $set: {
            quantity: quantity,
            total: { $multiply: ["$price", quantity] },
            discountTotal: { $multiply: ["$discountPrice", quantity] }
          }
        }
      ],
      { new: true, runValidators: false }
    );

    if (!cartItem) {
      return res.notFound({ error: "Cart item not found" });
    }

    const cart = await Cart.findOne({ items: req.params.id });
    if (cart) {
      await cart.calculateTotals();
    }

    const populatedCart = await getPopulatedCart(req.user._id);

    res.ok({
      message: "Cart item updated",
      cartItem,
      cart: populatedCart
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function removeCartItem(req, res) {
  try {
    const cart = await Cart.findOne({ items: req.params.id });
    if (!cart) {
      return res.notFound({ error: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.toString() !== req.params.id
    );
    await cart.save();

    await CartItem.findByIdAndDelete(req.params.id);
    await cart.calculateTotals();

    const populatedCart = await getPopulatedCart(req.user._id);

    res.ok({
      message: "Item removed from cart",
      cart: populatedCart
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function clearCart(req, res) {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.notFound({ error: "Cart not found" });
    }

    await CartItem.deleteMany({ _id: { $in: cart.items } });
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    cart.discountPrice = 0;
    cart.finalPrice = 0;
    await cart.save();

    const populatedCart = await getPopulatedCart(req.user._id);

    res.ok({
      message: "Cart cleared",
      cart: populatedCart || cart
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}
