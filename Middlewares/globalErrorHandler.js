const AppError = require("../Utils/appError");

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  const message = `${field}: "${value}" already exists. Please try another!`;
  return new AppError(message, 400);
};

const globalErrorHandler = (err, req, res, next) => {
  const env = process.env.NODE_ENV || "development";

  console.error(
    `🔥 ERROR OCCURRED AT ${new Date().toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
    })}:`,
    err
  );

  // Default values if not present
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Clone safely (keep prototype)
  let error = Object.create(err);
  error.message = err.message;

  // Handle MongoDB Duplicate Key Error
  if (err.code === 11000) error = handleDuplicateKeyError(err);

  if (env === "development") {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error,
      stack: error.stack,
    });
  } else {
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      console.error("❌ UNEXPECTED ERROR:", error);
      res.status(500).json({
        status: "error",
        message: "Something went very wrong!",
      });
    }
  }
};

module.exports = globalErrorHandler;
