import { authenticate, authorize } from "../middleware/auth.js";
import {
  getInventory,
  updateInventory,
  getLowStockProducts,
  getOutOfStockProducts
} from "../controllers/inventoryController.js";
import { USER_ROLES } from "../config/constants.js";

export function setupInventoryRoutes(app) {
  app.get(
    "/api/inventory/:productId",
    authenticate,
    authorize(USER_ROLES.ADMIN),
    getInventory
  );

  app.put(
    "/api/inventory/:productId",
    authenticate,
    authorize(USER_ROLES.ADMIN),
    updateInventory
  );

  app.get(
    "/api/inventory/low-stock",
    authenticate,
    authorize(USER_ROLES.ADMIN),
    getLowStockProducts
  );

  app.get(
    "/api/inventory/out-of-stock",
    authenticate,
    authorize(USER_ROLES.ADMIN),
    getOutOfStockProducts
  );
}
