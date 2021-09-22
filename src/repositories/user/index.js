const bcrypt = require('bcrypt');
const ServiceError = require('../../errors/service');
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

async function insertToken(userId, refreshToken) {
  await new Promise(
    (resolve, reject) => {
      db.run(
        `INSERT INTO token(user_id, token) 
          VALUES (?,?)`,
        [userId, refreshToken],
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

async function refreshUserToken(userId, oldRefreshToken, accessToken, refreshToken) {
  await new Promise(
    (resolve, reject) => {
      db.get(
        `SELECT count(*) as count FROM token
            WHERE user_id = ? AND token = ?
            `,
        [userId, oldRefreshToken],
        (error, row) => {
          if (error) {
            reject(error);
            return;
          }
          if (row.count === 0) {
            reject(new ServiceError('User unauthorized'));
            return;
          }
          db.run(
            `UPDATE token SET token = ?
                WHERE user_id = ? AND token = ?
                `,
            [refreshToken, userId, oldRefreshToken],
            (updateError) => {
              if (updateError) {
                reject(updateError);
                return;
              }
              resolve();
            },
          );
        },
      );
    },
  );
}

module.exports = {
  getUser,
  insertToken,
  insertUser,
  deleteUser,
  refreshUserToken,
};
