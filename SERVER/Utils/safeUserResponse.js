const ms = require("ms");
const signToken = require("../Utils/signToken.js");

const createSafeResponse = (user, statusCode, res, message = "Success") => {
  if (!user) {
    return res.status(500).json({
      status: "fail",
      message: "User data not found while creating response.",
    });
  }

  const safeData = user.toObject();
  safeData.id = user._id;

  const token = signToken(user._id);

  // Cookie maxAge in milliseconds
  const maxAge = ms(process.env.JWT_EXPIRES_IN || "7d"); // fallback 7 days

  // Cookie options
  const cookieOptions = {
    maxAge,
    httpOnly: true, // JS can't access cookie
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax", // Prevent CSRF, allow browser usage
    path: "/", // Available on all routes
  };

  // Send cookie
  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    message,
    data: { user: safeData },
  });
};

module.exports = createSafeResponse;
