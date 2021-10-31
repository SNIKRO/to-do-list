const bcrypt = require('bcrypt');
const db = require('../../db');

async function getUserByEmail(email) {
  await new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM user
        WHERE email = ?`,
      [email],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(row.count);
      },
    );
  });
}

async function insertUser(name, email, password) {
  await new Promise((resolve, reject) => {
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
