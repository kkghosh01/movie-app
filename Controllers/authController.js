const crypto = require("crypto");
const User = require("../Models/userModel.js");
const AppError = require("../Utils/appError.js");
const sendEmail = require("../Utils/email.js");
const createSafeResponse = require("../Utils/safeUserResponse.js");

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 10 * 60 * 1000;

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, avatar, role } = req.body;

    // Prevent self-assigning admin role
    const userRole = role === "admin" ? "user" : role;

    const newUser = await User.create({
      name,
      email,
      password,
      confirmPassword,
      avatar,
      role: userRole,
    });
    // RESPONSE HANDLING
    createSafeResponse(newUser, 201, res, "User created successfully");
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

    if (!user) {
      return next(new AppError("Incorrect email or password", 400));
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return next(new AppError("Account locked. Try again later.", 403));
    }

    const isCorrectPassword = await user.comparePassword(
      password,
      user.password
    );
    if (!isCorrectPassword) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
        await user.save();
        // Send lock email notification
        try {
          await sendEmail({
            email: user.email,
            subject: "Account Locked Due to Multiple Login Attempts",
            message: `Your account has been locked for ${
              LOCK_TIME / 60000
            } minutes due to multiple failed login attempts. If this wasn't you, reset your password immediately.`,
          });
        } catch (err) {
          return next(
            new AppError(
              "Failed to send account lock notification email. Please contact support.",
              500
            )
          );
        }

        return next(
          new AppError("Too many attempts. Account locked for 10 min.", 423)
        );
      }

      await user.save();
      return next(new AppError("Invalid credentials", 401));
    }

    // Successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // RESPONSE HANDLING
    createSafeResponse(user, 200, res, "Logged in successfully");
  } catch (error) {
    next(error);
  }
};

// Logout
const userLogout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    maxAge: 10 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Generate reset token
    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    //Construct reset URL
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`; // frontend route

    //Message for email
    const message = `We have received a password reset request. Please use the below link to reset your password\n\n${resetUrl}\n\nThis link will be valid for 10 minutes.`;

    //Try sending email
    try {
      await sendEmail({
        email: user.email,
        subject: "Password change request received",
        message,
      });
      res.status(200).json({
        status: "success",
        message: "Password reset link send to the user email",
      });
    } catch (error) {
      // rollback token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError("Error sending email. Try again later.", 500));
    }
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    user.passwordChangedAt = Date.now() - 1000;

    await user.save();

    // RESPONSE HANDLING
    createSafeResponse(user, 200, res, "Password reset successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  userLogin,
  userLogout,
  forgotPassword,
  resetPassword,
};
