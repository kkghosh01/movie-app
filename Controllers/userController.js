const User = require("../Models/userModel.js");

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

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser };
