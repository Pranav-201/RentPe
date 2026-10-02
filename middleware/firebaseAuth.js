import User from "../models/User.js";
import {
  FirebaseConfigurationError,
  getFirebaseAuth
} from "../config/firebase.js";

function getBearerToken(authorization) {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

function firebaseTokenErrorMessage(error) {
  switch (error.code) {
    case "auth/id-token-expired":
      return "Firebase token expired";
    case "auth/id-token-revoked":
      return "Firebase token revoked";
    default:
      return "Invalid Firebase token";
  }
}

function firebaseAccountError(message, status) {
  const error = new Error(message);
  error.code = "firebase/account-error";
  error.status = status;
  return error;
}

export async function getFirebaseAuthenticatedUser(token) {
  const decodedToken = await getFirebaseAuth().verifyIdToken(token, true);
  const user = await User.findOne({ firebaseUid: decodedToken.uid });

  if (!user) {
    throw firebaseAccountError(
      "Firebase account is authenticated but not linked to a RentPe account",
      401
    );
  }

  if (!user.isActive) {
    throw firebaseAccountError("Account is inactive", 403);
  }

  return {
    user,
    firebase: {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified === true,
      name: decodedToken.name,
      provider: decodedToken.firebase?.sign_in_provider
    }
  };
}

function sendFirebaseAuthenticationError(res, error) {
  if (error instanceof FirebaseConfigurationError) {
    return res.serverError({ error: "Firebase authentication is not configured" });
  }

  if (error.code === "firebase/account-error") {
    if (error.status === 403) {
      return res.forbidden({ error: error.message });
    }

    return res.unauthorized({ error: error.message });
  }

  if (error.code?.startsWith("auth/")) {
    return res.unauthorized({ error: firebaseTokenErrorMessage(error) });
  }

  return res.serverError({ error: "Firebase authentication is unavailable" });
}

export async function authenticateFirebase(req, res, next) {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    return res.unauthorized({ error: "Firebase Bearer token is required" });
  }

  try {
    const authenticated = await getFirebaseAuthenticatedUser(token);
    req.user = authenticated.user;
    req.firebase = authenticated.firebase;
    return next();
  } catch (error) {
    return sendFirebaseAuthenticationError(res, error);
  }
}

async function verifyFirebaseToken(req, res) {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    res.unauthorized({ error: "Firebase Bearer token is required" });
    return false;
  }

  try {
    const decodedToken = await getFirebaseAuth().verifyIdToken(token, true);
    req.firebase = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified === true,
      name: decodedToken.name,
      provider: decodedToken.firebase?.sign_in_provider
    };

    return true;
  } catch (error) {
    if (error instanceof FirebaseConfigurationError) {
      res.serverError({ error: "Firebase authentication is not configured" });
      return false;
    }

    if (error.code?.startsWith("auth/")) {
      res.unauthorized({ error: firebaseTokenErrorMessage(error) });
      return false;
    }

    res.serverError({ error: "Firebase authentication is unavailable" });
    return false;
  }
}

export async function authenticateFirebaseToken(req, res, next) {
  const verified = await verifyFirebaseToken(req, res);
  if (!verified) return;
  return next();
}
