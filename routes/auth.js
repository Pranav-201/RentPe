import { authenticate, authorize } from "../middleware/auth.js";
import { authenticateFirebaseToken } from "../middleware/firebaseAuth.js";
import { validate, validationSchemas } from "../middleware/validation.js";
import {
  register,
  login,
  getMe,
  updateProfile,
  syncFirebaseAccount
} from "../controllers/authController.js";
import { USER_ROLES } from "../config/constants.js";

export function setupAuthRoutes(app) {
  app.post(
    "/api/auth/register",
    validate(validationSchemas.register),
    register
  );

  app.post("/api/auth/login", validate(validationSchemas.login), login);

  app.post("/api/auth/firebase/sync", authenticateFirebaseToken, syncFirebaseAccount);

  app.get("/api/auth/me", authenticate, getMe);

  app.put("/api/auth/profile", authenticate, updateProfile);
}
