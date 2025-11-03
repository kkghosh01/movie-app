const globalErrorHandler = (err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  // if not custom error
  if (!err.isOperational) {
    err.statusCode = 500;
    err.status = "error";
    err.message = "Something went very wrong!";
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = globalErrorHandler;
