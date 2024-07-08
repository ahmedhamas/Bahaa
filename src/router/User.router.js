const express = require("express");
const router = express.Router();
const UserController = require("../controller/User.controller");
const { ValidateUser } = require("../middleware/vaildateUser");

router.post("/login", UserController.LoginStudent);
router.get("/profile", ValidateUser, UserController.StudentProfile);

module.exports = router;
