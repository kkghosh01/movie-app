const express = require("express");
const { createUser } = require("../Controllers/userController.js");

const router = express.Router();

router.route("/signup").post(createUser);

module.exports = router;
