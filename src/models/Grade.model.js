module.exports = class GradeModel {
  constructor(grade) {
    this.grade = grade;
  }

  Create() {
    const { grade } = this;
    const sql = "INSERT INTO Grades (id, grade_name) VALUES (?, ?)";

    return new Promise((resolve, reject) => {
      db.run(sql, [grade.id, grade.name], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  GetAll() {
    const sql = "SELECT * FROM Grades";
    return new Promise((resolve, reject) => {
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};
