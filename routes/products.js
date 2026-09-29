import { authenticate } from "../middleware/auth.js";
import { validate, validationSchemas } from "../middleware/validation.js";
import {
  getAllProducts,
  getProductById,
  getMyListings,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

export function setupProductRoutes(app) {
  app.get("/api/products", getAllProducts);

  app.get("/api/products/user/my-listings", authenticate, getMyListings);

  app.get("/api/products/:id", getProductById);

  app.post(
    "/api/products",
    authenticate,
    validate(validationSchemas.product),
    createProduct
  );

  app.put(
    "/api/products/:id",
    authenticate,
    validate(validationSchemas.product),
    updateProduct
  );

  app.delete(
    "/api/products/:id",
    authenticate,
    deleteProduct
  );
}
