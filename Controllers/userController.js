const User = require("../Models/userModel.js");
const AppError = require("../Utils/appError.js");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, avatar } = req.body;

    const newUser = await User.create({
      name,
      email,
      password,
      confirmPassword,
      avatar,
    });

    const userData = newUser.toObject();
    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      data: {
        user: userData,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("email and password is required", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 400));
    }
    const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, userLogin };
