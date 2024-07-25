const TeacherModel = require("../models/Teacher.model");
const GradeModel = require("../models/Grade.model");

const GetAll = async (req, res) => {
  const tokenData = req.headers["user-id"];
  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const Grades = await new GradeModel({}).GetAll();

    res.json({ Grades });
  } catch (err) {
    console.error(err);
    res.status(500).send("internal server error");
  }
};

const Delete = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const id = req.params.id;
  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await new GradeModel({ id: id }).Delete();

    res.json({ done: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("internal server error");
  }
};

const Add = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const { grade_name } = req.body;

  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await new GradeModel({ name: grade_name }).Create();

    res.json({ done: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("internal server error");
  }
};

module.exports = {
  GetAll,
  Delete,
  Add,
};
