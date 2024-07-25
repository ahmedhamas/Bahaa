const express = require("express");
const router = express.Router();
const {
  GradeHomeworks,
  HomeworkQustions,
  SubmitHomework,
  GetAll,
  Add,
  Delete,
  GetStudents,
  GetQuestions,
} = require("../controller/Homework.controller");
const { ValidateUser, ValidateTeacher } = require("../middleware/vaildateUser");

router.get("/", ValidateUser, GradeHomeworks);
router.get("/quistions/:id", ValidateUser, HomeworkQustions);
router.post("/quistions/:id", ValidateUser, SubmitHomework);
router.get("/getall/:grade_id/:page", ValidateTeacher, GetAll);
router.post("/add", ValidateTeacher, Add);
router.delete("/delete/:id", ValidateTeacher, Delete);
router.get("/students/:id", ValidateTeacher, GetStudents);
router.get("/questions/:id", ValidateTeacher, GetQuestions);

module.exports = router;
