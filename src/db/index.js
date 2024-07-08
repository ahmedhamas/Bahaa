const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("./src/db/quiz.db3", (err) => {
  if (err) {
    return console.error(err.message);
  }
});

module.exports = db;
