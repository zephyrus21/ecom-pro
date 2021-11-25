const express = require("express");
const { signup } = require("../controllers/userController");
const router = express.Router();

router.route("signup").get(signup);

module.exports.user = router;
