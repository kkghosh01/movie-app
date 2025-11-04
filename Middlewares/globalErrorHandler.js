const globalErrorHandler = (err, req, res, next) => {
  const env = process.env.NODE_ENV || "development";

  // Console log for all environments (optional)
  console.error(
    `🔥 ERROR OCCURRED AT ${new Date().toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
    })}:`,
    err
  );

  // If not custom/operational error, set default
  if (!err.isOperational) {
    err.statusCode = 500;
    err.status = "error";
    if (env === "production") {
      // Hide internal error details in production
      err.message = "Something went very wrong!";
    }
  }

  // Response according to environment
  if (env === "development") {
    // Detailed error for dev
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    // Production → user-friendly
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

module.exports = globalErrorHandler;
