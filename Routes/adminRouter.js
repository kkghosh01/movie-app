const express = require("express");
const { protect, restrictRole } = require("../Middlewares/authMiddleware.js");
const {
  createAdminByadmin,
  updateUserByAdmin,
  deleteUserByAdmin,
} = require("../Controllers/adminController.js");

const router = express.Router();

// Admin-only route for all users
router.use(protect);
router.route("/create-admin").post(restrictRole("admin"), createAdminByadmin);
router
  .route("/:id")
  .patch(restrictRole("admin"), updateUserByAdmin)
  .delete(restrictRole("admin"), deleteUserByAdmin);

module.exports = router;
