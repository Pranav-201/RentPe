import { authenticate } from "../middleware/auth.js";
import { validate, validationSchemas } from "../middleware/validation.js";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
} from "../controllers/reviewController.js";

export function setupReviewRoutes(app) {
  app.get("/api/products/:productId/reviews", getProductReviews);

  app.post(
    "/api/products/:productId/reviews",
    authenticate,
    validate(validationSchemas.review),
    createReview
  );

  app.put(
    "/api/reviews/:id",
    authenticate,
    validate(validationSchemas.review),
    updateReview
  );

  app.delete("/api/reviews/:id", authenticate, deleteReview);
}
