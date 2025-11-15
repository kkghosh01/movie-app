const User = require("../Models/userModel.js");
const AppError = require("../Utils/appError.js");
const createSafeResponse = require("../Utils/safeUserResponse.js");
const filterReqObj = require("../Utils/filtereReqObj.js");

/**
 * Admin-only: Create a new admin
 * Only accessible by an existing admin
 */
const createAdminByadmin = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, avatar, role } = req.body;

    // Check required fields
    if (!name || !email || !password || !confirmPassword) {
      return next(new AppError("Name, email, password are required", 400));
    }

    //  Prevent role override by non-admin (extra safety)
    const assignedRole = role === "admin" ? "admin" : "user";

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError("User with this email already exists", 400));
    }

    // Create new admin/user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      confirmPassword,
      avatar,
      role: assignedRole,
      active: true,
    });

    // Audit log
    console.log(
      `🛡️ Admin ${req.user.email} created a new ${assignedRole}: ${newUser.email}`
    );

    // Response (without exposing password, sensitive info)
    createSafeResponse(
      newUser,
      201,
      res,
      `New ${assignedRole} created successfully`
    );
  } catch (err) {
    next(err);
  }
};

const updateUserByAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Prevent admin from updating themselves
    if (req.user.id === user.id) {
      return next(new AppError("You cannot update your own data here", 400));
    }

    // Allow admin to toggle active on admin (ONLY active field)
    if (user.role === "admin") {
      const allowed = ["active"]; // only allow active change
      const filtered = filterReqObj(req.body, ...allowed);

      if (!("active" in filtered)) {
        return next(
          new AppError("You can only toggle active for another admin", 403)
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        filtered,
        {
          new: true,
          runValidators: true,
        }
      );

      return createSafeResponse(
        updatedUser,
        200,
        res,
        "Admin active status updated successfully"
      );
    }

    // Only allow certain fields to be updated by admin
    const allowedFields = ["name", "email", "role", "avatar", "active"];
    const filteredObj = filterReqObj(req.body, ...allowedFields);

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      filteredObj,
      {
        new: true,
        runValidators: true,
      }
    );

    // Send safe response
    createSafeResponse(
      updatedUser,
      200,
      res,
      "User updated successfully by admin"
    );
  } catch (error) {
    next(error);
  }
};

// Admin soft-deletes a user by setting active: false
const deleteUserByAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Prevent admin from deleting themselves
    if (req.user.id === user.id) {
      return next(new AppError("You cannot delete your own account", 400));
    }

    // Prevent admin from deleting another admin
    if (user.role === "admin") {
      return next(new AppError("You cannot delete another admin", 403));
    }

    // Soft delete user
    user.active = false;
    await user.save({ validateBeforeSave: false });

    res.status(204).json({
      status: "success",
      message: "User has been deactivated",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAdminByadmin, updateUserByAdmin, deleteUserByAdmin };
