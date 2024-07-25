const db = require("../db");

module.exports = class HomeworkModel {
  constructor(homework) {
    this.homework = homework;
  }

  static Count() {
    const sql = "SELECT COUNT(*) AS count FROM Homework";
    return new Promise((resolve, reject) => {
      db.get(sql, [], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  Create() {
    const { homework } = this;
    const sql =
      "INSERT INTO Homework (homework_name, grade_id, created_at, term_id) VALUES (?, ?, ?, ?)";
    return new Promise((resolve, reject) => {
      db.run(
        sql,
        [
          homework.homework_name,
          homework.grade_id,
          homework.created_at,
          homework.term_id,
        ],
        function (err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  Delete() {
    const { homework } = this;
    const sql = "DELETE FROM Homework WHERE id = ?";
    return new Promise((resolve, reject) => {
      db.run(sql, [homework.id], function (err) {
        if (err) reject(err);
        resolve(this.lastID);
      });
    });
  }

  GetAll() {
    const { homework } = this;
    console.log(homework);
    let sql = `SELECT Homework.id, Homework.homework_name, Grade.grade_name, Homework.created_at, Homework.term_id FROM Homework INNER JOIN Grade ON Homework.grade_id = Grade.id`;
    if (homework.grade || homework.grade !== 0) {
      sql += ` WHERE Homework.grade_id = ${homework.grade} ORDER BY Homework.created_at DESC LIMIT ${homework.limit} OFFSET ${homework.offset}`;
    } else {
      sql += ` ORDER BY Homework.created_at DESC LIMIT ${homework.limit} OFFSET ${homework.offset}`;
    }

    return new Promise((resolve, reject) => {
      db.all(sql, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  GetResults() {
    const { homework } = this;

    if (homework.public) {
      const sql =
        "SELECT UserHomeworkResult.id, UserHomeworkResult.homework_id, UserHomeworkResult.result, Homework.homework_name FROM UserHomeworkResult INNER JOIN Homework ON UserHomeworkResult.homework_id = Homework.id WHERE user_id = ? AND public = ?";
      return new Promise((resolve, reject) => {
        db.all(sql, [homework.user, homework.public], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
    } else {
      const sql =
        "SELECT  UserHomeworkResult.homework_id, UserHomeworkResult.result, Homework.homework_name, UserHomeworkResult.public AS isPublic FROM UserHomeworkResult INNER JOIN Homework ON UserHomeworkResult.homework_id = Homework.id WHERE user_id = ? ORDER BY public ASC";
      return new Promise((resolve, reject) => {
        db.all(sql, [homework.user], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
    }
  }
  GetNotDone() {
    const { homework } = this;
    let sql =
      "SELECT * FROM Homework WHERE id NOT IN (SELECT homework_id FROM UserHomeworkResult WHERE user_id = ?) AND grade_id = ?";

    return new Promise((resolve, reject) => {
      db.all(sql, [homework.user, homework.grade_id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  GetNotDoneById() {
    const { homework } = this;
    const sql =
      "SELECT * FROM Homework WHERE id NOT IN (SELECT homework_id FROM UserHomeworkResult WHERE user_id = ?) AND grade_id = ? AND id = ?";
    return new Promise((resolve, reject) => {
      db.get(
        sql,
        [homework.user, homework.grade_id, homework.id],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }

  GetQustions() {
    const { homework } = this;
    const sql =
      "SELECT Questions.id, Questions.question, QuestionChoices.the_choice, (SELECT COUNT(QuestionTextAnswers.the_answer) FROM QuestionTextAnswers WHERE QuestionTextAnswers.question_id = Questions.id) AS number_of_inputs FROM Questions LEFT JOIN QuestionChoices ON Questions.id = QuestionChoices.question_id LEFT JOIN QuestionTextAnswers ON Questions.id = QuestionTextAnswers.question_id WHERE Questions.homework_id = ?";
    return new Promise((resolve, reject) => {
      db.all(sql, [homework.id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  GetAnswers() {
    const { homework } = this;
    const sql =
      "SELECT Questions.id, QuestionChoices.is_right_choice, QuestionChoices.the_choice, QuestionTextAnswers.the_answer FROM Questions LEFT JOIN QuestionChoices ON Questions.id = QuestionChoices.question_id LEFT JOIN QuestionTextAnswers ON Questions.id = QuestionTextAnswers.question_id WHERE Questions.homework_id = ?";
    return new Promise((resolve, reject) => {
      db.all(sql, [homework.id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  AddHomeworkResult() {
    const { homework } = this;
    console.log(homework.user);
    const sql =
      "INSERT INTO UserHomeworkResult (user_id, homework_id, result) VALUES (?, ?, ?)";
    return new Promise((resolve, reject) => {
      db.run(sql, [homework.user, homework.id, homework.result], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  AddUserAnswer(isChoice) {
    const { homework } = this;
    let sqlStr =
      "INSERT INTO UserAnswerHomework (user_id, question_id, answer, is_right, homework_id) VALUES (?, ?, ?, ?, ?)";

    if (isChoice) {
      sqlStr = sqlStr.replace("answer", "choice_answer");
    } else {
      sqlStr = sqlStr.replace("answer", "text_answer");
    }

    return new Promise((resolve, reject) => {
      db.run(
        sqlStr,
        [
          homework.user,
          homework.question,
          homework.answer,
          homework.isRight,
          homework.id,
        ],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }

  static Average() {
    const sql =
      "SELECT Homework.id, Homework.homework_name AS name, AVG(UserHomeworkResult.result) as متوسط_​​نتيجة_الواجبات_المنزلية FROM Homework INNER JOIN UserHomeworkResult ON UserHomeworkResult.homework_id = Homework.id GROUP BY Homework.id LIMIT 5;";
    return new Promise((resolve, reject) => {
      db.all(sql, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  NumberOfQuestions() {
    const { homework } = this;
    const sql = `SELECT SUM(right_choices_count) AS total_right_choices_count, SUM(text_answers_count) AS total_text_answers_count FROM (SELECT SUM(CASE WHEN QuestionChoices.is_right_choice = 1 THEN 1 ELSE 0 END) AS right_choices_count, COUNT(QuestionTextAnswers.id) AS text_answers_count FROM Questions LEFT JOIN QuestionChoices ON QuestionChoices.question_id = Questions.id LEFT JOIN QuestionTextAnswers ON QuestionTextAnswers.question_id = Questions.id WHERE Questions.homework_id = ? GROUP BY Questions.id ) AS subquery`;
    return new Promise((resolve, reject) => {
      db.get(sql, [homework.id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  GetTestQustions() {
    const { homework } = this;
    const sql =
      "SELECT Questions.id, Questions.question, QuestionChoices.is_right_choice, QuestionChoices.the_choice, QuestionTextAnswers.the_answer FROM Questions LEFT JOIN QuestionChoices ON Questions.id = QuestionChoices.question_id LEFT JOIN QuestionTextAnswers ON Questions.id = QuestionTextAnswers.question_id WHERE Questions.homework_id = ?";

    return new Promise((resolve, reject) => {
      db.all(sql, [homework.id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
};
