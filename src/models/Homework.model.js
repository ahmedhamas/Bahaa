const db = require("../db");

module.exports = class HomeworkModel {
  constructor(homework) {
    this.homework = homework;
  }

  GetResults() {
    const { homework } = this;
    const sql =
      "SELECT UserHomeworkResult.id, UserHomeworkResult.homework_id, UserHomeworkResult.result, Homework.homework_name FROM UserHomeworkResult INNER JOIN Homework ON UserHomeworkResult.homework_id = Homework.id WHERE user_id = ? AND public = ?";
    return new Promise((resolve, reject) => {
      db.all(sql, [homework.user, homework.public], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
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
      "SELECT Qustions.id, Qustions.qustion, QustionChoices.the_choice, (SELECT COUNT(QustionTextAnswers.the_answer) FROM QustionTextAnswers WHERE QustionTextAnswers.question_id = Qustions.id) AS number_of_inputs FROM Qustions LEFT JOIN QustionChoices ON Qustions.id = QustionChoices.question_id LEFT JOIN QustionTextAnswers ON Qustions.id = QustionTextAnswers.question_id WHERE Qustions.homework_id = ?";
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
      "SELECT Qustions.id, QustionChoices.is_right_choice, QustionChoices.the_choice, QustionTextAnswers.the_answer FROM Qustions LEFT JOIN QustionChoices ON Qustions.id = QustionChoices.question_id LEFT JOIN QustionTextAnswers ON Qustions.id = QustionTextAnswers.question_id WHERE Qustions.homework_id = ?";
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
      "INSERT INTO UserAnswerHomework (user_id, question_id, answer, is_right) VALUES (?, ?, ?, ?)";

    if (isChoice) {
      sqlStr = sqlStr.replace("answer", "choise_answer");
    } else {
      sqlStr = sqlStr.replace("answer", "text_answer");
    }

    return new Promise((resolve, reject) => {
      db.run(
        sqlStr,
        [homework.user, homework.question, homework.answer, homework.isRight],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }
};
