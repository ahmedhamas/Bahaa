const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User.model");
const HomeworkModel = require("../models/Homework.model");
const TestModel = require("../models/Tests.model");
const TeacherModel = require("../models/Teacher.model");

const LoginStudent = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Please enter username and password" });
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  try {
    const userId = await new UserModel({
      username,
      password: hashedPassword,
    }).Login();
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "80y",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      // sameSite: "none",
      maxAge: 80 * 365 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Login Successful" });
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Invalid username or password" });
  }
};

const StudentProfile = async (req, res) => {
  const tokenData = req.headers["user-id"];
  try {
    const user = await new UserModel({ id: tokenData.userId }).Get();

    const homework = await new HomeworkModel({
      user: tokenData.userId,
      public: 1,
    }).GetResults();

    const tests = await new TestModel({
      user: tokenData.userId,
      public: 1,
    }).GetResults();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const profile = { ...user, ...{ homework }, ...{ tests } };

    res.status(200).json({ profile });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error:
        "Error while fetching profile Please try again Or contact the Teacher",
    });
  }
};

const Achievements = async (req, res) => {
  const tokenData = req.headers["user-id"];
  try {
    const user = await new UserModel({ id: tokenData.userId }).Get();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const GetResults = await new UserModel({
      id: tokenData.userId,
    }).Results();

    const allResults = [...GetResults[0], ...GetResults[1]];

    res.status(200).json({ results: allResults, user: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error:
        "Error while fetching profile Please try again Or contact the Teacher",
    });
  }
};

const GetAll = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const page = JSON.parse(req.params.page);
  const grade = req.params.grade;
  try {
    let pageLimit = 30 / page;
    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const studentCount = await new UserModel().Count();

    const pageNumbers = Math.ceil(studentCount.count / pageLimit);

    const users = await new UserModel({ limit: pageLimit, grade }).GetAll();

    res.status(200).json({ users, pageNumbers });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error:
        "Error while fetching profile Please try again Or contact the Teacher",
    });
  }
};

const Edit = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const { username, grade, isBlocked, BlockReason, parent_phone, id } =
    req.body;
  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await new UserModel({
      id,
      username,
      grade,
      isBlocked,
      BlockReason,
      parent_phone,
    }).Edit();

    res.status(200).json({ message: "Profile Updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error:
        "Error while fetching profile Please try again Or contact the Teacher",
    });
  }
};

const Add = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const { username, grade, password, isBlocked, BlockReason, parent_phone } =
    req.body;
  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await new UserModel({
      username,
      grade,
      password,
      isBlocked,
      BlockReason,
      parent_phone,
    }).Create();

    res.status(200).json({ message: "Profile Added" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error:
        "Error while fetching profile Please try again Or contact the Teacher",
    });
  }
};

const Delete = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const { id } = req.params;
  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await new UserModel({ id }).Delete();
    res.status(200).json({ message: "Profile Deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error:
        "Error while fetching profile Please try again Or contact the Teacher",
    });
  }
};
const Logout = async (req, res) => {
  console.log("hi");
  res.clearCookie("token");
  res.status(200).json({ message: "Logout Successful" });
};

module.exports = {
  LoginStudent,
  StudentProfile,
  Achievements,
  Logout,
  GetAll,
  Edit,
  Add,
  Delete,
};
