const express = require("express");
const router = express.Router();
const {
  TeacherLogin,
  TeacherProfile,
  StudentProfile,
  Answers,
  EditAnswers,
  Publish,
  AddQuestion,
  DeleteQuestion,
} = require("../controller/Teacher.controller");
const { ValidateTeacher } = require("../middleware/vaildateUser");

router.post("/login", TeacherLogin);
router.get("/profile", ValidateTeacher, TeacherProfile);
router.get("/student/:id", ValidateTeacher, StudentProfile);
router.get("/answers/:type/:id/:student_id", ValidateTeacher, Answers);
router.put("/edit/answers/:id", ValidateTeacher, EditAnswers);
router.put("/publish", ValidateTeacher, Publish);
router.post("/questions", ValidateTeacher, AddQuestion);
router.delete("/questions", ValidateTeacher, DeleteQuestion);

module.exports = router;
