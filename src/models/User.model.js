const db = require("../db");
const { v4: uuidv4 } = require("uuid");

module.exports = class UserModel {
  constructor(user) {
    this.user = user;
  }

  Create() {
    const { user } = this;
    user.id = uuidv4();
    const sql =
      "INSERT INTO User (id, username, grade_id, password, isBlocked, BlockReason, parent_phone) VALUES (?, ?, ?, ?, ?, ?, ?)";

    return new Promise((resolve, reject) => {
      db.run(
        sql,
        [
          user.id,
          user.username,
          user.grade,
          user.password,
          user.isBlocked,
          user.BlockReason,
          user.parent_phone,
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  Login() {
    const { user } = this;
    const sql = "SELECT * FROM User WHERE username = ? AND password = ?";

    return new Promise((resolve, reject) => {
      db.get(sql, [user.username, user.password], (err, row) => {
        if (err) reject(err);
        if (!row || !row["id"]) reject("Invalid username or password");
        resolve(row["id"]);
      });
    });
  }

  Get() {
    const { user } = this;
    const sql =
      "SELECT User.username, User.grade_id, Grade.grade_name FROM User INNER JOIN Grade ON User.grade_id = Grade.id WHERE User.id = ?";
    return new Promise((resolve, reject) => {
      db.get(sql, [user.id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  Results() {
    const { user } = this;
    const tests = new Promise((resolve, reject) => {
      const sql =
        "SELECT Tests.test_name, Tests.id AS isTest, UserTestResult.result FROM UserTestResult LEFT JOIN Tests ON UserTestResult.test_id = Tests.id WHERE UserTestResult.user_id = ? AND UserTestResult.public = 1 AND UserTestResult.result > 50";

      db.all(sql, [user.id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    const homeworks = new Promise((resolve, reject) => {
      const sql =
        "SELECT Homework.homework_name, Homework.id AS isHomework, UserHomeworkResult.result FROM UserHomeworkResult LEFT JOIN Homework ON UserHomeworkResult.homework_id = Homework.id WHERE UserHomeworkResult.user_id = ? AND UserHomeworkResult.public = 1 AND UserHomeworkResult.result > 50";

      db.all(sql, [user.id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    return Promise.all([tests, homeworks]);
  }

  HighAchievers() {
    const sql =
      "SELECT User.id, User.username, Grade.grade_name, AVG(UserTestResult.result) AS average FROM User INNER JOIN UserTestResult ON UserTestResult.user_id = User.id INNER JOIN Grade ON Grade.id = User.grade_id GROUP BY User.id, User.username, User.isBlocked, Grade.grade_name HAVING AVG(UserTestResult.result) IN ( SELECT MAX(avg_result) FROM (SELECT Grade.id as grade_id, AVG(UserTestResult.result) as avg_result FROM User INNER JOIN UserTestResult ON UserTestResult.user_id = User.id INNER JOIN Grade ON Grade.id = User.grade_id GROUP BY Grade.id ) AS subquery )";
    return new Promise((resolve, reject) => {
      db.all(sql, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  Statics() {
    const { user } = this;
    const sql =
      "SELECT Tests.test_name, UserTestResult.result AS نتائج FROM UserTestResult INNER JOIN Tests ON UserTestResult.test_id = Tests.id WHERE UserTestResult.user_id = ? AND Tests.grade_id = ? LIMIT 5";
    return new Promise((resolve, reject) => {
      db.all(sql, [user.id, user.grade], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  GetAll() {
    const { user } = this;
    const sql = `SELECT User.BlockReason, User.parent_phone, Grade.grade_name, User.isBlocked, User.id, User.username FROM User INNER JOIN Grade ON User.grade_id = Grade.id ${
      user.grade !== "all" ? "WHERE User.grade_id =" + user.grade : ""
    } LIMIT ? OFFSET ?`;

    console.log(sql);

    return new Promise((resolve, reject) => {
      db.all(sql, [user.limit, user.offset], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  Count() {
    const { user } = this;
    const sql = "SELECT COUNT(*) AS count FROM User";
    return new Promise((resolve, reject) => {
      db.get(sql, [], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  Edit() {
    const { user } = this;
    const sql =
      "UPDATE User SET username = ?, grade_id = ?, isBlocked = ?, BlockReason = ?, parent_phone = ? WHERE id = ?";
    return new Promise((resolve, reject) => {
      db.run(
        sql,
        [
          user.username,
          user.grade,
          user.isBlocked,
          user.BlockReason,
          user.parent_phone,
          user.id,
        ],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }
  Delete() {
    const { user } = this;
    const sql = "DELETE FROM User WHERE id = ?";
    return new Promise((resolve, reject) => {
      db.run(sql, [user.id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  GetStudents() {
    const { user } = this;
    const Table =
      user.type === "test" ? "UserTestResult" : "UserHomeworkResult";
    const sql = `SELECT ${Table}.id, ${Table}.${
      user.type === "test" ? "test_id" : "homework_id"
    }, ${user.type === "test" ? "Tests" : "Homework"}.${
      user.type === "test" ? "test_name" : "homework_name"
    }, ${Table}.public, ${Table}.result, User.username, ${Table}.user_id FROM ${Table} INNER JOIN User ON User.id = ${Table}.user_id INNER JOIN ${
      user.type === "test" ? "Tests" : "Homework"
    } ON ${user.type === "test" ? "Tests" : "Homework"}.id = ${Table}.${
      user.type === "test" ? "test_id" : "homework_id"
    } WHERE ${Table}.${user.type === "test" ? "test_id" : "homework_id"} = ?`;

    return new Promise((resolve, reject) => {
      db.all(sql, [user.test], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
};
