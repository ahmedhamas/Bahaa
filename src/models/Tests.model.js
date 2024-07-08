const db = require("../db");

module.exports = class TestModel {
  constructor(test) {
    this.test = test;
  }

  GetResults() {
    const { test } = this;
    //TODO: make new method for charts and add this too it SUM(UserTestResult.result) as tests_teaken
    const sql =
      "SELECT UserTestResult.id, UserTestResult.result, Tests.test_name, Tests.created_at FROM UserTestResult INNER JOIN Tests ON UserTestResult.test_id = Tests.id WHERE user_id = ? AND public = ?";
    return new Promise((resolve, reject) => {
      db.all(sql, [test.user, test.public], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
  GetNotDone() {
    const { test } = this;
    let sql =
      "SELECT * FROM Tests WHERE id NOT IN (SELECT test_id FROM UserTestResult WHERE user_id = ?) AND grade_id = ?";

    return new Promise((resolve, reject) => {
      db.all(sql, [test.user, test.grade_id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  GetNotDoneById() {
    const { test } = this;
    const sql =
      "SELECT * FROM Tests WHERE id NOT IN (SELECT test_id FROM UserTestResult WHERE user_id = ?) AND grade_id = ? AND id = ?";
    return new Promise((resolve, reject) => {
      db.get(sql, [test.user, test.grade_id, test.id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  GetQustions() {
    const { test } = this;
    const sql =
      "SELECT Qustions.id, Qustions.qustion, QustionChoices.the_choice, (SELECT COUNT(QustionTextAnswers.the_answer) FROM QustionTextAnswers WHERE QustionTextAnswers.question_id = Qustions.id) AS number_of_inputs FROM Qustions LEFT JOIN QustionChoices ON Qustions.id = QustionChoices.question_id LEFT JOIN QustionTextAnswers ON Qustions.id = QustionTextAnswers.question_id WHERE Qustions.test_id = ?";
    return new Promise((resolve, reject) => {
      db.all(sql, [test.id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  GetAnswers() {
    const { test } = this;
    const sql =
      "SELECT Qustions.id, QustionChoices.is_right_choice, QustionChoices.the_choice, QustionTextAnswers.the_answer FROM Qustions LEFT JOIN QustionChoices ON Qustions.id = QustionChoices.question_id LEFT JOIN QustionTextAnswers ON Qustions.id = QustionTextAnswers.question_id WHERE Qustions.test_id = ?";
    return new Promise((resolve, reject) => {
      db.all(sql, [test.id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
  AddTestResult() {
    const { test } = this;

    const sql =
      "INSERT INTO UserTestResult (user_id, test_id, result) VALUES (?, ?, ?)";
    return new Promise((resolve, reject) => {
      db.run(sql, [test.user, test.id, test.result], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  AddUserAnswer(isChoice) {
    const { test } = this;
    let sqlStr =
      "INSERT INTO UserAnswerTest (user_id, question_id, answer, is_right) VALUES (?, ?, ?, ?)";

    if (isChoice) {
      sqlStr = sqlStr.replace("answer", "choise_answer");
    } else {
      sqlStr = sqlStr.replace("answer", "text_answer");
    }

    return new Promise((resolve, reject) => {
      db.run(
        sqlStr,
        [test.user, test.question, test.answer, test.isRight],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }
};
