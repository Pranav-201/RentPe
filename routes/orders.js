import { authenticate, authorize } from "../middleware/auth.js";
import { validate, validationSchemas } from "../middleware/validation.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} from "../controllers/orderController.js";
import { USER_ROLES } from "../config/constants.js";

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
    authorize(USER_ROLES.ADMIN),
    updateOrderStatus
  );

  app.patch("/api/orders/:id/cancel", authenticate, cancelOrder);
}
