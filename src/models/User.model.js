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
      "INSERT INTO User (id, username, grade, password) VALUES (?, ?, ?, ?)";

    return new Promise((resolve, reject) => {
      db.run(
        sql,
        [user.id, user.username, user.grade, user.password],
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
};
