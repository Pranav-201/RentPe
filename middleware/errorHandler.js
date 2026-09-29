export function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    return res.badRequest({
      error: "Validation error",
      details: Object.values(err.errors).map((e) => e.message)
    });
  }

  if (err.name === "CastError") {
    return res.badRequest({
      error: "Invalid ID format"
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.conflict({
      error: `${field} already exists`
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.unauthorized({
      error: "Invalid token"
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.unauthorized({
      error: "Token expired"
    });
  }

  res.serverError({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
}