const express = require("express");
const router = express.Router();
const UserController = require("../controller/User.controller");
const { ValidateUser, ValidateTeacher } = require("../middleware/vaildateUser");

router.post("/login", UserController.LoginStudent);
router.get("/profile", ValidateUser, UserController.StudentProfile);
router.get("/achievements", ValidateUser, UserController.Achievements);
router.get("/all/:page/:grade", ValidateTeacher, UserController.GetAll);
router.put("/edit", ValidateTeacher, UserController.Edit);
router.post("/add", ValidateTeacher, UserController.Add);
router.delete("/user/:id", ValidateUser, UserController.Delete);
router.get("/logout", UserController.Logout);

module.exports = router;
