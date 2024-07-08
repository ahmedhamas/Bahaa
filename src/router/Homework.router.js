const express = require("express");
const router = express.Router();
const {
  GradeHomeworks,
  HomeworkQustions,
  SubmitHomework,
} = require("../controller/Homework.controller");
const { ValidateUser } = require("../middleware/vaildateUser");

router.get("/", ValidateUser, GradeHomeworks);
router.get("/quistions/:id", ValidateUser, HomeworkQustions);
router.post("/quistions/:id", ValidateUser, SubmitHomework);

module.exports = router;
