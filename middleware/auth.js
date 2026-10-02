import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticateFirebase } from "./firebaseAuth.js";

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.unauthorized({ error: "No token provided" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return authenticateFirebase(req, res, next);
  }

  try {
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.unauthorized({ error: "User not found or inactive" });
    }

    req.user = user;
    return next();
  } catch {
    return res.serverError({ error: "Authentication is unavailable" });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.unauthorized({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.forbidden({ error: "Access denied" });
    }

    return next();
  };
}
