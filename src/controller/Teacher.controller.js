const TeacherModel = require("../models/Teacher.model");
const TestModel = require("../models/Tests.model");
const HomeworkModel = require("../models/Homework.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User.model");
const { calculatePercentage } = require("../utils");

const TeacherLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const userId = await new TeacherModel({
      username,
      password: hashedPassword,
    }).Login();

    const token = jwt.sign({ userId: userId.id }, process.env.JWT_SECRET, {
      expiresIn: "80y",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      // sameSite: "none",
      maxAge: 80 * 365 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const TeacherProfile = async (req, res) => {
  const tokenData = req.headers["user-id"];

  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const StudentAvgInTests = await TestModel.Average();
    const StudentAvgInHomework = await HomeworkModel.Average();
    const HighAchievers = await new UserModel({
      id: tokenData.userId,
    }).HighAchievers();

    res.status(200).json({
      StudentAvgInTests,
      StudentAvgInHomework,
      HighAchievers: HighAchievers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const StudentProfile = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const studentId = req.params.id;
  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const student = await new UserModel({ id: studentId }).Get();

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const homeworks = await new HomeworkModel({
      user: studentId,
    }).GetResults();

    const tests = await new TestModel({
      user: studentId,
    }).GetResults();

    const statics = await new UserModel({
      id: studentId,
      grade: student.grade_id,
    }).Statics();

    res.status(200).json({ student, homeworks, tests, statics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const Answers = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const params = req.params;

  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const answers = await new TeacherModel({
      student: params.student_id,
      type: params.type,
      type_id: params.id,
    }).getAnswers();

    res.status(200).json({ answers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const EditAnswers = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const { is_right, answer_id, type, student_id, type_id } = req.body;
  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await new TeacherModel({
      type,
      answer_id,
      is_right,
    }).EditAnswers();

    const Orgnalresult = await new TeacherModel({
      type,
      user: student_id,
      test: type_id,
    }).Results();

    let newResult = 0;

    if (type === "test") {
      const NumberOfQuestions = await new TestModel({
        id: type_id,
      }).NumberOfQuestions();
      newResult =
        NumberOfQuestions.total_right_choices_count +
        NumberOfQuestions.total_text_answers_count;
    } else {
      const NumberOfQuestions = await new HomeworkModel({
        id: type_id,
      }).NumberOfQuestions();
      newResult =
        NumberOfQuestions.total_right_choices_count +
        NumberOfQuestions.total_text_answers_count;
    }

    const percentage = calculatePercentage(Orgnalresult.total_right, newResult);

    await new TeacherModel({
      type: type,
      user: student_id,
      id: type_id,
      result: percentage.toFixed(2),
    }).EditResult();

    res.status(200).json({ message: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const Publish = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const { type, student_id, id, public } = req.body;
  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await new TeacherModel({
      type,
      user: student_id,
      id,
      public,
    }).Publish();

    res.status(200).json({ message: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  TeacherLogin,
  TeacherProfile,
  StudentProfile,
  Answers,
  EditAnswers,
  Publish,
};
