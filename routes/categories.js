import { authenticate, authorize } from "../middleware/auth.js";
import { validate, validationSchemas } from "../middleware/validation.js";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";
import { USER_ROLES } from "../config/constants.js";

export function setupCategoryRoutes(app) {
  app.get("/api/categories", getAllCategories);

  app.get("/api/categories/:id", getCategoryById);

  app.post(
    "/api/categories",
    authenticate,
    validate(validationSchemas.category),
    createCategory
  );

  app.put(
    "/api/categories/:id",
    authenticate,
    validate(validationSchemas.category),
    updateCategory
  );

  app.delete(
    "/api/categories/:id",
    authenticate,
    deleteCategory
  );
}
