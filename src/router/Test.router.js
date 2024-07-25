const express = require("express");
const router = express.Router();
const {
  GradeTests,
  TestQustions,
  SubmitTest,
  GetAll,
  Add,
  Delete,
  GetStudents,
  GetQuestions,
} = require("../controller/Test.controller");
const { ValidateUser, ValidateTeacher } = require("../middleware/vaildateUser");

router.get("/", ValidateUser, GradeTests);
router.get("/quistions/:id", ValidateUser, TestQustions);
router.post("/quistions/:id", ValidateUser, SubmitTest);
router.get("/getall/:grade_id/:page", ValidateTeacher, GetAll);
router.post("/add", ValidateTeacher, Add);
router.delete("/delete/:id", ValidateTeacher, Delete);
router.get("/students/:id", ValidateTeacher, GetStudents);
router.get("/questions/:id", ValidateTeacher, GetQuestions);

module.exports = router;
