const express = require("express");
const { createUser, userLogin } = require("../Controllers/userController.js");

const router = express.Router();

router.route("/signup").post(createUser);
router.route("/login").post(userLogin);

module.exports = router;
