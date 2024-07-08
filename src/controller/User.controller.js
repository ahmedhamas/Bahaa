const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User.model");
const HomeworkModel = require("../models/Homework.model");
const TestModel = require("../models/Tests.model");

const LoginStudent = async (req, res) => {
  const { username, password } = req.body;

  console.log(username, password);
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

module.exports = {
  LoginStudent,
  StudentProfile,
};
