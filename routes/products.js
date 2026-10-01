import { authenticate } from "../middleware/auth.js";
import { validate, validationSchemas } from "../middleware/validation.js";
import { uploadProductImages } from "../middleware/productImageUpload.js";
import {
  getAllProducts,
  getProductById,
  getMyListings,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  getCampuses
} from "../controllers/productController.js";

export function setupProductRoutes(app) {
  app.get("/api/products", getAllProducts);

  app.get("/api/products/campuses", getCampuses);

  app.get("/api/products/user/my-listings", authenticate, getMyListings);

  app.get("/api/products/:id", getProductById);

  app.post(
    "/api/products",
    authenticate,
    uploadProductImages,
    validate(validationSchemas.product),
    createProduct
  );

  app.put(
    "/api/products/:id",
    authenticate,
    uploadProductImages,
    validate(validationSchemas.product),
    updateProduct
  );

  app.patch(
    "/api/products/:id/status",
    authenticate,
    validate(validationSchemas.productStatus),
    updateProductStatus
  );

  app.delete(
    "/api/products/:id",
    authenticate,
    deleteProduct
  );
}
