// Centralized error handler. Controllers call next(err) or throw inside try/catch.
export function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  console.error("❌", err.message);

  // Multer file-size / filter errors
  if (err.name === "MulterError" || err.message?.startsWith("Unsupported file")) {
    return res.status(400).json({ message: err.message });
  }
  // Mongo duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    return res.status(409).json({ message: "That email is already registered" });
  }

  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({ message: err.message || "Server error" });
}
