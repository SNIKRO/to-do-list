const bcrypt = require('bcrypt');
const db = require('../../db');

function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM user
        WHERE email = ?`,
      [email],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(row);
      },
    );
  });
}

function insertUser(name, email, password) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO user(name, email, password)
         VALUES (?, ?, ?)`,
      [name, email, bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)],
      function (error) {
        if (error) {
          reject(error);
        }
        resolve(this.lastID);
      },
    );
  });
}

module.exports = {
  getUserByEmail,
  insertUser,
};
