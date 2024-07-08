const express = require("express");
const router = express.Router();
const {
  GradeTests,
  TestQustions,
  SubmitTest,
} = require("../controller/Test.controller");
const { ValidateUser } = require("../middleware/vaildateUser");

router.get("/", ValidateUser, GradeTests);
router.get("/quistions/:id", ValidateUser, TestQustions);
router.post("/quistions/:id", ValidateUser, SubmitTest);

module.exports = router;
