import "dotenv/config";
import zingoo from "zingoo";
import { errorHandler } from "./middleware/errorHandler.js";
import { setupAuthRoutes } from "./routes/auth.js";
import { setupProductRoutes } from "./routes/products.js";
import { setupCategoryRoutes } from "./routes/categories.js";
import { setupCartRoutes } from "./routes/cart.js";
import { setupOrderRoutes } from "./routes/orders.js";
import { setupReviewRoutes } from "./routes/reviews.js";
import { setupInventoryRoutes } from "./routes/inventory.js";
import { setupAIRoutes } from "./routes/ai.js";

export function createApp() {
  const app = zingoo();

  // Built-in Zingoo middleware
  app.cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173"
  });

  app.rateLimit({
    windowMs: 60000,
    max: 100
  });

  // Health check
  app.get("/", (req, res) => {
    res.ok({
      message: "Zingoo E-commerce Backend API",
      version: "1.0.0",
      status: "running"
    });
  });

  // Setup all routes
  setupAuthRoutes(app);
  setupProductRoutes(app);
  setupCategoryRoutes(app);
  setupCartRoutes(app);
  setupOrderRoutes(app);
  setupReviewRoutes(app);
  setupInventoryRoutes(app);
  setupAIRoutes(app);

  // Error handler (must be last)
  app.onError(errorHandler);
  return app;
}