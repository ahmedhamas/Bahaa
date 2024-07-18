const db = require("../db");

module.exports = class TestModel {
  constructor(test) {
    this.test = test;
  }

  GetResults() {
    const { test } = this;

    if (test.public) {
      const sql =
        "SELECT UserTestResult.id, UserTestResult.result, Tests.test_name, Tests.created_at FROM UserTestResult INNER JOIN Tests ON UserTestResult.test_id = Tests.id WHERE user_id = ? AND public = ?";
      return new Promise((resolve, reject) => {
        db.all(sql, [test.user, test.public], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
    } else {
      const sql =
        "SELECT UserTestResult.result, UserTestResult.test_id, Tests.test_name, UserTestResult.public AS isPublic FROM UserTestResult INNER JOIN Tests ON UserTestResult.test_id = Tests.id WHERE user_id = ? ORDER BY public ASC";
      return new Promise((resolve, reject) => {
        db.all(sql, [test.user], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
    }
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
      "SELECT Questions.id, Questions.question, QuestionChoices.the_choice, (SELECT COUNT(QuestionTextAnswers.the_answer) FROM QuestionTextAnswers WHERE QuestionTextAnswers.question_id = Questions.id) AS number_of_inputs FROM Questions LEFT JOIN QuestionChoices ON Questions.id = QuestionChoices.question_id LEFT JOIN QuestionTextAnswers ON Questions.id = QuestionTextAnswers.question_id WHERE Questions.test_id = ?";
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
      "SELECT Questions.id, QuestionChoices.is_right_choice, QuestionChoices.the_choice, QuestionTextAnswers.the_answer FROM Questions LEFT JOIN QuestionChoices ON Questions.id = QuestionChoices.question_id LEFT JOIN QuestionTextAnswers ON Questions.id = QuestionTextAnswers.question_id WHERE Questions.test_id = ?";
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
      "INSERT INTO UserAnswerTest (user_id, question_id, answer, is_right, test_id) VALUES (?, ?, ?, ? , ?)";

    if (isChoice) {
      sqlStr = sqlStr.replace("answer", "choice_answer");
    } else {
      sqlStr = sqlStr.replace("answer", "text_answer");
    }

    return new Promise((resolve, reject) => {
      db.run(
        sqlStr,
        [test.user, test.question, test.answer, test.isRight, test.id],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }

  static Average() {
    const sql =
      "SELECT Tests.id, Tests.test_name AS name, AVG(UserTestResult.result) AS متوسط_​​نتيجة_الاختبار FROM Tests INNER JOIN UserTestResult ON UserTestResult.test_id = Tests.id GROUP BY Tests.id LIMIT 5";
    return new Promise((resolve, reject) => {
      db.all(sql, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  NumberOfQuestions() {
    const { test } = this;
    const sql = `SELECT SUM(right_choices_count) AS total_right_choices_count, SUM(text_answers_count) AS total_text_answers_count FROM (SELECT SUM(CASE WHEN QuestionChoices.is_right_choice = 1 THEN 1 ELSE 0 END) AS right_choices_count, COUNT(QuestionTextAnswers.id) AS text_answers_count FROM Questions LEFT JOIN QuestionChoices ON QuestionChoices.question_id = Questions.id LEFT JOIN QuestionTextAnswers ON QuestionTextAnswers.question_id = Questions.id WHERE Questions.test_id = ? GROUP BY Questions.id ) AS subquery`;
    return new Promise((resolve, reject) => {
      db.get(sql, [test.id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }
};
