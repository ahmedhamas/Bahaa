const db = require("../db");

module.exports = class TeacherModel {
  constructor(teacher) {
    this.teacher = teacher;
  }

  Get() {
    const { teacher } = this;
    const sql = "SELECT * FROM Teacher WHERE id = ?";

    return new Promise((resolve, reject) => {
      db.get(sql, [teacher.id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  Login() {
    const { teacher } = this;
    const sql = "SELECT * FROM Teacher WHERE username = ? AND password = ?";

    return new Promise((resolve, reject) => {
      db.get(sql, [teacher.username, teacher.password], (err, row) => {
        if (err) reject(err);
        if (!row) reject("Invalid username or password");
        resolve(row);
      });
    });
  }
  async queryDatabase(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  async getQuestions(teacherTypeId) {
    const sql = `SELECT Questions.id, Questions.question, QuestionChoices.is_right_choice, QuestionChoices.the_choice, QuestionTextAnswers.the_answer FROM Questions LEFT JOIN QuestionChoices ON QuestionChoices.question_id = Questions.id LEFT JOIN QuestionTextAnswers ON QuestionTextAnswers.question_id = Questions.id WHERE Questions.${this.teacher.type}_id = ?`;
    return this.queryDatabase(sql, [teacherTypeId]);
  }

  async getStudentAnswers(questionIds) {
    const sql = `SELECT * FROM ${
      this.teacher.type === "test" ? "UserAnswerTest" : "UserAnswerHomework"
    } WHERE user_id="${
      this.teacher.student
    }" AND question_id IN (${questionIds.join(",")}) ORDER BY question_id`;
    return this.queryDatabase(sql);
  }

  async getAnswers() {
    const questions = await this.getQuestions(this.teacher.type_id);
    const questionIds = [...new Set(questions.map((question) => question.id))];
    const answers = await this.getStudentAnswers(questionIds);
    return { questions, answers };
  }

  EditAnswers() {
    const { teacher } = this;
    const sql = `UPDATE ${
      teacher.type === "test" ? "UserAnswerTest" : "UserAnswerHomework"
    } SET is_right = ? WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.run(sql, [teacher.is_right, teacher.answer_id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  Results() {
    const { teacher } = this;
    const Table =
      teacher.type === "test" ? "UserTestResult" : "UserHomeworkResult";
    const SumTable =
      teacher.type === "test" ? "UserAnswerTest" : "UserAnswerHomework";
    const sql = `SELECT SUM(${SumTable}.is_right) AS total_right FROM ${Table} INNER JOIN ${SumTable} ON ${SumTable}.${
      teacher.type === "test" ? "test_id" : "homework_id"
    } = ${Table}.${
      teacher.type === "test" ? "test_id" : "homework_id"
    } WHERE ${Table}.user_id = ? AND ${Table}.${
      teacher.type === "test" ? "test_id" : "homework_id"
    } = ?`;

    return new Promise((resolve, reject) => {
      db.get(sql, [teacher.user, teacher.test], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  EditResult() {
    const { teacher } = this;
    const Table =
      teacher.type === "test" ? "UserTestResult" : "UserHomeworkResult";
    const sql = `UPDATE ${Table} SET result = ? WHERE user_id = ? AND ${
      teacher.type === "test" ? "test_id" : "homework_id"
    } = ?`;

    return new Promise((resolve, reject) => {
      db.run(sql, [teacher.result, teacher.user, teacher.id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  Publish() {
    const { teacher } = this;
    console.log(teacher);
    const Table =
      teacher.type === "test" ? "UserTestResult" : "UserHomeworkResult";
    const sql = `UPDATE ${Table} SET public = ? WHERE ${
      teacher.type === "test" ? "test_id" : "homework_id"
    } = ? AND user_id = ?`;
    return new Promise((resolve, reject) => {
      db.run(sql, [teacher.public, teacher.id, teacher.user], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
};
