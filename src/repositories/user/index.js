const bcrypt = require('bcrypt');
const db = require('../../db');

async function getUser(email) {
  await new Promise(
    (resolve, reject) => {
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
    },
  );
}

async function insertUser(name, email, password) {
  await new Promise(
    (resolve, reject) => {
      db.run(
        `INSERT INTO user(name, email, password)
         VALUES (?, ?, ?)`,
        [name,
          email,
          bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
        ],
        (error) => {
          if (error) {
            reject(error);
          }
          resolve();
        },
      );
    },
  );
}

async function deleteUser(userId) {
  await new Promise(
    (resolve, reject) => {
      db.run(
        `DELETE FROM token 
         WHERE user_id = ? 
        `,
        [userId],
        (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        },
      );
    },
  );
}

module.exports = {
  getUser,
  insertUser,
  deleteUser,
};
