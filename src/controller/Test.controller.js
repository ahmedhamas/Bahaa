const UserModel = require("../models/User.model");
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
      throw new Error("User not found");
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

module.exports = {
  GradeTests,
  TestQustions,
  SubmitTest,
};
