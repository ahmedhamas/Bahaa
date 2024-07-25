const db = require("../db/index.js");

module.exports = class GradeModel {
  constructor(grade) {
    this.grade = grade;
  }

  Create() {
    const { grade } = this;
    const sql = "INSERT INTO Grade (grade_name) VALUES (?)";

    return new Promise((resolve, reject) => {
      db.run(sql, [grade.name], function (err) {
        if (err) reject(err);
        resolve();
      });
    });
  }

  GetAll() {
    const sql = "SELECT * FROM Grade";
    return new Promise((resolve, reject) => {
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  Delete() {
    const { grade } = this;
    const sql = "DELETE FROM Grade WHERE id = ?";
    return new Promise((resolve, reject) => {
      db.run(sql, [grade.id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
};
