const db = require("../db");

module.exports = class PublicTestModel {
  constructor(test) {
    this.test = test;
  }

  static Count() {
    const sql = "SELECT COUNT(*) AS count FROM PublicTests";
    return new Promise((resolve, reject) => {
      db.get(sql, [], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  Create() {
    const { test } = this;
    const sql =
      "INSERT INTO PublicTests (test_name, grade_id, created_at, expire_date, term_id) VALUES (?, ?, ?, ?, ?)";
    return new Promise((resolve, reject) => {
      db.run(
        sql,
        [
          test.test_name,
          test.grade_id,
          test.created_at,
          test.expire_date,
          test.term_id,
        ],
        function (err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  Delete() {
    const { test } = this;
    const sql = "DELETE FROM PublicTests WHERE id = ?";
    return new Promise((resolve, reject) => {
      db.run(sql, [test.id], function (err) {
        if (err) reject(err);
        resolve(this.lastID);
      });
    });
  }

  GetAll() {
    const { test } = this;
    let sql =
      "SELECT PublicTests.id, PublicTests.test_name, Grade.grade_name, PublicTests.created_at, PublicTests.expire_date, PublicTests.term_id FROM PublicTests INNER JOIN Grade ON PublicTests.grade_id = Grade.id";
    if (test.grade || test.grade !== 0) {
      sql += ` WHERE PublicTests.grade_id = ${test.grade} ORDER BY PublicTests.created_at DESC LIMIT ${test.limit} OFFSET ${test.offset}`;
    } else {
      sql += ` ORDER BY PublicTests.created_at DESC LIMIT ${test.limit} OFFSET ${test.offset}`;
    }

    return new Promise((resolve, reject) => {
      db.all(sql, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  GetResults() {
    const { test } = this;

    if (test.public) {
      const sql =
        "SELECT TempUserResult.id, TempUserResult.result, PublicTests.test_name, PublicTests.created_at FROM TempUserResult INNER JOIN PublicTests ON TempUserResult.test_id = PublicTests.id WHERE user_id = ? AND public = ?";
      return new Promise((resolve, reject) => {
        db.all(sql, [test.user, test.public], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
    } else {
      const sql =
        "SELECT TempUserResult.result, TempUserResult.test_id, PublicTests.test_name, TempUserResult.public AS isPublic FROM TempUserResult INNER JOIN PublicTests ON TempUserResult.test_id = PublicTests.id WHERE user_id = ? ORDER BY public ASC";
      return new Promise((resolve, reject) => {
        db.all(sql, [test.user], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
    }
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
      "INSERT INTO TempUserResult (name, phone, test_id, result) VALUES (?, ?, ?, ?)";
    return new Promise((resolve, reject) => {
      db.run(sql, [test.name, test.phone, test.id, test.result], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  AddUserAnswer(isChoice) {
    const { test } = this;
    let sqlStr =
      "INSERT INTO TempUserAnswers (name, question_id, answer, is_right, test_id) VALUES (?, ?, ?, ? , ?)";

    if (isChoice) {
      sqlStr = sqlStr.replace("answer", "choice_answer");
    } else {
      sqlStr = sqlStr.replace("answer", "text_answer");
    }

    return new Promise((resolve, reject) => {
      db.run(
        sqlStr,
        [test.name, test.question, test.answer, test.isRight, test.id],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
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

  GetTestQustions() {
    const { test } = this;
    const sql =
      "SELECT Questions.id, Questions.question, QuestionChoices.is_right_choice, QuestionChoices.the_choice, QuestionTextAnswers.the_answer FROM Questions LEFT JOIN QuestionChoices ON Questions.id = QuestionChoices.question_id LEFT JOIN QuestionTextAnswers ON Questions.id = QuestionTextAnswers.question_id WHERE Questions.test_id = ?";

    return new Promise((resolve, reject) => {
      db.all(sql, [test.id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  GetStudents() {
    const { test } = this;
    const sql = `SELECT TempUserResult.id, TempUserResult.test_id, PublicTests.test_name, TempUserResult.public, TempUserResult.result, TempUserResult.name, TempUserResult.phone FROM TempUserResult INNER JOIN PublicTests ON PublicTests.id = TempUserResult.test_id WHERE TempUserResult.id = ?`;

    return new Promise((resolve, reject) => {
      db.all(sql, [test.id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
};
