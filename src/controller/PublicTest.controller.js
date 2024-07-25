const UserModel = require("../models/User.model");
const TeacherModel = require("../models/Teacher.model");
const PublicTestModel = require("../models/PublicTests.model");
const {
  shuffleArray,
  GetAnswersFromArray,
  AutoCorrector,
} = require("../utils/index");

const TestQustions = async (req, res) => {
  const Test_id = req.params.id;

  try {
    const quistions = await new PublicTestModel({
      id: Test_id,
    }).GetQustions();

    shuffleArray(quistions);

    res.status(200).json({ quistions: quistions });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        "Error while fetching Qustions Please try again Or contact the Teacher"
      );
  }
};

const SubmitTest = async (req, res) => {
  const { id } = req.params;

  const { answers, user } = req.body;

  try {
    const choices = GetAnswersFromArray(answers, true);
    const text_answers = GetAnswersFromArray(answers, false);

    const QustionsAnswers = await new PublicTestModel({
      id: id,
    }).GetAnswers();

    if (!QustionsAnswers) {
      throw new Error("Answers not found");
    }

    const filterdAnswers = QustionsAnswers.map((answer) => {
      Object.keys(answer).forEach((key) => {
        if (answer[key] === null) {
          delete answer[key];
        }
      });
      return answer;
    });

    const answersArray = filterdAnswers.reduce((acc, answer) => {
      if (typeof answer.the_choice === "string") {
        acc.push({
          question_id: answer.id,
          choice: answer.the_choice,
          isRight: answer.is_right_choice,
        });
      } else {
        const textAnswer = acc.find((a) => a.question_id === answer.id);
        if (!textAnswer) {
          acc.push({
            question_id: answer.id,
            text_answer: [answer.the_answer],
          });
        } else {
          textAnswer.text_answer.push(answer.the_answer);
        }
      }
      return acc;
    }, []);

    const userAnswers = [...choices, ...text_answers];
    const correctedAnswers = AutoCorrector(answersArray, userAnswers);

    await new PublicTestModel({
      id: id,
      name: user.name,
      phone: user.phone,
      result: correctedAnswers.percentage,
    }).AddTestResult();

    await Promise.all(
      correctedAnswers.userAnswers.map(async (answer) => {
        if (answer.isRight === undefined) {
          answer.isRight = false;
        }
        if (answer.choice !== undefined) {
          await new PublicTestModel({
            name: user.name,
            phone: user.phone,
            question: answer.question_id,
            answer: answer.choice,
            isRight: answer.isRight,
            id: id,
          }).AddUserAnswer(true);
        }

        if (answer.text_answer !== undefined) {
          for (const textAnswer of answer.text_answer) {
            await new PublicTestModel({
              name: user.name,
              phone: user.phone,
              question: answer.question_id,
              answer: textAnswer,
              isRight: answer.isRight,
              id: id,
            }).AddUserAnswer();
          }
        }
      })
    );
    res.status(200).send("Test Submitted Successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

const GetAll = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const { grade_id, page } = req.params;
  try {
    const pageLimit = 30;
    const user = await new TeacherModel({ id: tokenData.userId }).Get();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const studentCount = await PublicTestModel.Count();

    const pageNumbers = Math.ceil(studentCount.count / pageLimit);

    const tests = await new PublicTestModel({
      grade: parseInt(grade_id),
      limit: pageLimit,
      offset: (parseInt(page) - 1) * pageLimit,
    }).GetAll();

    res.status(200).json({ tests: tests, totalPages: pageNumbers });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        "Error while fetching Tests Please try again Or contact the Teacher"
      );
  }
};

const Add = async (req, res) => {
  const tokenData = req.headers["user-id"];

  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const test = await new PublicTestModel({
      test_name: req.body.test_name,
      grade_id: req.body.grade_id,
      created_at: req.body.created_at,
      expire_date: req.body.expire_date,
      term_id: req.body.term_id,
    }).Create();
    res.status(200).json({ test: test });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        "Error while fetching Tests Please try again Or contact the Teacher"
      );
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
    const test = await new PublicTestModel({ id: id }).Delete();
    res.status(200).json({ test: test });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        "Error while fetching Tests Please try again Or contact the Teacher"
      );
  }
};

const GetStudents = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const { id } = req.params;
  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const students = await new PublicTestModel({
      id: id,
    }).GetStudents();

    res.status(200).json({ students: students });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};

const GetQuestions = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const { id } = req.params;
  try {
    const user = await new TeacherModel({ id: tokenData.userId }).Get();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const questions = await new PublicTestModel({ id: id }).GetTestQustions();
    res.status(200).json({ questions: questions });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        "Error while fetching Tests Please try again Or contact the Teacher"
      );
  }
};

module.exports = {
  TestQustions,
  SubmitTest,
  GetAll,
  Add,
  Delete,
  GetStudents,
  GetQuestions,
};
