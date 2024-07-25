const UserModel = require("../models/User.model");
const TeacherModel = require("../models/Teacher.model");
const TestsModel = require("../models/Tests.model");
const {
  shuffleArray,
  GetAnswersFromArray,
  AutoCorrector,
} = require("../utils/index");

const GradeTests = async (req, res) => {
  const tokenData = req.headers["user-id"];

  try {
    const user = await new UserModel({ id: tokenData.userId }).Get();

    const TestNotDone = await new TestsModel({
      user: tokenData.userId,
      grade_id: user.grade_id,
    }).GetNotDone();

    res.status(200).json({ user: user, tests: TestNotDone });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        "Error while fetching Tests Please try again Or contact the Teacher"
      );
  }
};

const TestQustions = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const Test_id = req.params.id;

  try {
    const user = await new UserModel({ id: tokenData.userId }).Get();

    const GetTestsNotDone = await new TestsModel({
      user: tokenData.userId,
      grade_id: user.grade_id,
      id: Test_id,
    }).GetNotDoneById();

    if (!GetTestsNotDone) {
      res
        .status(500)
        .send(
          "Error while fetching Qustions Please try again Or contact the Teacher"
        );
    }

    const quistions = await new TestsModel({
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
  const tokenData = req.headers["user-id"];
  const { id } = req.params;

  const { answers } = req.body;

  try {
    const user = await new UserModel({ id: tokenData.userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const choices = GetAnswersFromArray(answers, true);
    const text_answers = GetAnswersFromArray(answers, false);

    const QustionsAnswers = await new TestsModel({
      id: id,
    }).GetAnswers();

    if (!QustionsAnswers) {
      throw new Error("Answers not found");
    }

    const filterdAnswers = QustionsAnswers.filter((answer) => {
      if (answer.is_right_choice === null || answer.is_right_choice === 0) {
        delete answer.is_right_choice;
        delete answer.the_choice;
      }

      if (answer.the_answer === null) {
        delete answer.the_answer;
      }

      return answer;
    });

    const answersArray = [];

    filterdAnswers.forEach((answer) => {
      if (answer.is_right_choice === 1 || answer.the_choice !== undefined) {
        answersArray.push({
          question_id: answer.id,
          choice: answer.the_choice,
          isRight: answer.is_right_choice,
        });
      }
      if (answer.the_answer !== undefined) {
        const textAnswer = answersArray.find(
          (a) => a.question_id === answer.id
        );
        if (!textAnswer) {
          answersArray.push({
            question_id: answer.id,
            text_answer: [answer.the_answer],
          });
        } else {
          textAnswer.text_answer.push(answer.the_answer);
        }
      }
    });

    const userAnswers = [...choices, ...text_answers];
    const correctedAnswers = AutoCorrector(answersArray, userAnswers);

    await new TestsModel({
      id: id,
      user: tokenData.userId,
      result: correctedAnswers.percentage,
    }).AddTestResult();

    await Promise.all(
      correctedAnswers.userAnswers.map(async (answer) => {
        if (answer.isRight === undefined) {
          answer.isRight = false;
        }
        if (answer.choice !== undefined) {
          await new TestsModel({
            user: tokenData.userId,
            question: answer.question_id,
            answer: answer.choice,
            isRight: answer.isRight,
            id: id,
          }).AddUserAnswer(true);
        }

        if (answer.text_answer !== undefined) {
          for (const textAnswer of answer.text_answer) {
            await new TestsModel({
              user: tokenData.userId,
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

    const studentCount = await TestsModel.Count();

    const pageNumbers = Math.ceil(studentCount.count / pageLimit);

    const tests = await new TestsModel({
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
    const test = await new TestsModel({
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
    const test = await new TestsModel({ id: id }).Delete();
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

    const students = await new UserModel({
      test: id,
      type: "test",
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
    const questions = await new TestsModel({ id: id }).GetTestQustions();
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
  GradeTests,
  TestQustions,
  SubmitTest,
  GetAll,
  Add,
  Delete,
  GetStudents,
  GetQuestions,
};
