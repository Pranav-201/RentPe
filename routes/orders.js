import { authenticate } from "../middleware/auth.js";
import { validate, validationSchemas } from "../middleware/validation.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  addOrderMessage,
  cancelOrder
} from "../controllers/orderController.js";

export function setupOrderRoutes(app) {
  app.post(
    "/api/orders",
    authenticate,
    validate(validationSchemas.order),
    createOrder
  );

  app.get("/api/orders", authenticate, getOrders);

  app.get("/api/orders/:id", authenticate, getOrderById);

  app.patch(
    "/api/orders/:id/status",
    authenticate,
    updateOrderStatus
  );

  app.post(
    "/api/orders/:id/messages",
    authenticate,
    addOrderMessage
  );

  app.patch("/api/orders/:id/cancel", authenticate, cancelOrder);
}
