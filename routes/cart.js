import { authenticate } from "../middleware/auth.js";
import { validate, validationSchemas } from "../middleware/validation.js";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart
} from "../controllers/cartController.js";

export function setupCartRoutes(app) {
  app.get("/api/cart", authenticate, getCart);

  app.post(
    "/api/cart/items",
    authenticate,
    validate(validationSchemas.cartItem),
    addCartItem
  );

  app.put(
    "/api/cart/items/:id",
    authenticate,
    validate(validationSchemas.updateCartItem),
    updateCartItem
  );

  app.delete("/api/cart/items/:id", authenticate, removeCartItem);

  app.delete("/api/cart", authenticate, clearCart);
}
