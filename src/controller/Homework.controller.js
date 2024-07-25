const UserModel = require("../models/User.model");
const HomeworkModel = require("../models/Homework.model");
const TeacherModel = require("../models/Teacher.model");
const {
  shuffleArray,
  GetAnswersFromArray,
  AutoCorrector,
} = require("../utils/index");

const GradeHomeworks = async (req, res) => {
  const tokenData = req.headers["user-id"];

  try {
    const user = await new UserModel({ id: tokenData.userId }).Get();

    const homeworkNotDone = await new HomeworkModel({
      user: tokenData.userId,
      grade_id: user.grade_id,
    }).GetNotDone();

    res.status(200).json({ user: user, homeworks: homeworkNotDone });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        "Error while fetching Homeworks Please try again Or contact the Teacher"
      );
  }
};

const HomeworkQustions = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const homework_id = req.params.id;

  try {
    const user = await new UserModel({ id: tokenData.userId }).Get();

    const GetHomeworksNotDone = await new HomeworkModel({
      user: tokenData.userId,
      grade_id: user.grade_id,
      id: homework_id,
    }).GetNotDoneById();

    if (!GetHomeworksNotDone) {
      res
        .status(500)
        .send(
          "Error while fetching Qustions Please try again Or contact the Teacher"
        );
    }

    const quistions = await new HomeworkModel({
      id: homework_id,
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

const SubmitHomework = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const { id } = req.params;

  const { answers } = req.body;

  try {
    const user = await new UserModel({ id: tokenData.userId }).Get();

    if (!user) {
      throw new Error("User not found");
    }

    const choices = GetAnswersFromArray(answers, true);
    const text_answers = GetAnswersFromArray(answers, false);

    const QustionsAnswers = await new HomeworkModel({
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

    await new HomeworkModel({
      id: id,
      user: tokenData.userId,
      result: correctedAnswers.percentage,
    }).AddHomeworkResult();

    await Promise.all(
      correctedAnswers.userAnswers.map(async (answer) => {
        if (answer.isRight === undefined) {
          answer.isRight = false;
        }
        if (answer.choice !== undefined) {
          await new HomeworkModel({
            user: tokenData.userId,
            question: answer.question_id,
            answer: answer.choice,
            isRight: answer.isRight,
            id: id,
          }).AddUserAnswer(true);
        }

        if (answer.text_answer !== undefined) {
          for (const textAnswer of answer.text_answer) {
            await new HomeworkModel({
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
    res.status(200).send("Homework Submitted Successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

const GetAll = async (req, res) => {
  const tokenData = req.headers["user-id"];
  const { grade_id, page } = req.params;
  try {
    let pageLimit = 30;

    const user = await new TeacherModel({ id: tokenData.userId }).Get();

    if (!user) {
      throw new Error("User not found");
    }

    const studentCount = await HomeworkModel.Count();

    const pageNumbers = Math.ceil(studentCount.count / pageLimit);

    const offset = (parseInt(page) - 1) * pageLimit;

    const tests = await new HomeworkModel({
      grade: parseInt(grade_id),
      limit: pageLimit,
      offset: offset,
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
      throw new Error("User not found");
    }
    const test = await new HomeworkModel({
      homework_name: req.body.homework_name,
      grade_id: req.body.grade_id,
      created_at: req.body.created_at,
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
      throw new Error("User not found");
    }
    const test = await new HomeworkModel({ id: id }).Delete();
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

    console.log();
    const students = await new UserModel({
      test: id,
      type: "homework",
    }).GetStudents();

    res.status(200).json({ students: students });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        "Error while fetching Tests Please try again Or contact the Teacher"
      );
  }
};

const GetQuestions = async (req, res) => {
  const { userId } = req.headers["user-id"];
  const { id } = req.params;

  try {
    const user = await new TeacherModel({ id: userId }).Get();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const questions = await new HomeworkModel({ id }).GetTestQustions();

    res.status(200).json({ questions });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        "Error while fetching Tests. Please try again or contact the teacher."
      );
  }
};

module.exports = {
  GradeHomeworks,
  HomeworkQustions,
  SubmitHomework,
  GetAll,
  Add,
  Delete,
  GetStudents,
  GetQuestions,
};
