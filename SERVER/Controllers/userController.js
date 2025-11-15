const User = require("../Models/userModel.js");
const AppError = require("../Utils/appError.js");
const filterReqObj = require("../Utils/filtereReqObj.js");
const createSafeResponse = require("../Utils/safeUserResponse.js");

const getPublicUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      active: { $ne: false },
      role: "user",
    });

    res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
    });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    // Fetch all users including inactive and admins
    const users = await User.find().select("+active");

    res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = (req, res) => {
  const user = req.user;
  createSafeResponse(user, 200, res);
};

const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    if (
      !(await user.comparePassword(req.body.currentPassword, user.password))
    ) {
      return next(
        new AppError("The current password is wrong. Please try again!", 401)
      );
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    user.passwordChangedAt = Date.now() - 1000;

    await user.save();

    // RESPONSE HANDLING
    createSafeResponse(user, 200, res, "Password updated successfully");
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const filteredObj = filterReqObj(req.body, "name", "email", "avatar");
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
      runValidators: true,
      new: true,
    });
    createSafeResponse(
      updatedUser,
      200,
      res,
      "User details updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

const deleteMe = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      return next(
        new AppError("Admins cannot self-delete. Contact another admin.", 400)
      );
    }

    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicUsers,
  getAllUsers,
  getUserProfile,
  updatePassword,
  updateMe,
  deleteMe,
};
