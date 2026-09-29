import { authenticate, authorize } from "../middleware/auth.js";
import { validate, validationSchemas } from "../middleware/validation.js";
import {
  register,
  login,
  getMe,
  updateProfile
} from "../controllers/authController.js";
import { USER_ROLES } from "../config/constants.js";

export function setupAuthRoutes(app) {
  app.post(
    "/api/auth/register",
    validate(validationSchemas.register),
    register
  );

  app.post("/api/auth/login", validate(validationSchemas.login), login);

  app.get("/api/auth/me", authenticate, getMe);

  app.put("/api/auth/profile", authenticate, updateProfile);
}
