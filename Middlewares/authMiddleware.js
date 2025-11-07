const jwt = require("jsonwebtoken");
const User = require("../Models/userModel.js");
const AppError = require("../Utils/appError.js");

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next(new AppError("You are not loged in", 401));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("The user no longer exists", 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = protect;
