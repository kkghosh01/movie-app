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

  res.status(statusCode).json({
    status: "success",
    message,
    data: { user: safeData },
    token,
  });
};

module.exports = createSafeResponse;
