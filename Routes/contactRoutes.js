const express = require("express");
const contactUs = require("../Controllers/contactController");

const router = express.Router();

router.post("/", contactUs);

module.exports = router;
