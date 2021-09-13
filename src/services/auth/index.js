const jwt = require('jsonwebtoken'); // access token
const { v4: uuid } = require('uuid');// refresh token
const bcrypt = require('bcrypt');
const config = require('../../../config.json');
const db = require('../../db');
const ServiceError = require('../../errors/service');

function signIn(email, password) {
  return new Promise(
    (resolve, reject) => {
      db.get(`SELECT id, password FROM user 
      WHERE email = ? `,
      [email],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        if (!row
          || !bcrypt.compareSync(password, row.password)) {
          reject(new ServiceError('Pair email/password is incorrect'));
          return;
        }
        const accessToken = jwt.sign({ userId: row.id }, config.KEY);
        const refreshToken = uuid();
        db.run(`INSERT INTO token(user_id, token) 
          VALUES (?,?)`,
        [row.id, refreshToken], (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ accessToken, refreshToken });
        });
      });
    },
  );
}

function signUp(name, email, password) {
  return new Promise(
    (resolve, reject) => {
      db.get(
        `SELECT id FROM user
        WHERE email = ?`,
        [email],
        (error, row) => {
          if (error) {
            reject(error);
            return;
          }
          if (row) {
            reject(new ServiceError('email has been taken'));
            return;
          }
          db.run(
            'INSERT INTO user(name, email, password) VALUES (?, ?, ?)',
            [
              name,
              email,
              bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
            ],
            (insertionError) => {
              if (insertionError) {
                reject(insertionError);
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

function logOut(user) {
  return new Promise(
    (resolve, reject) => {
      db.run(
        `DELETE FROM token 
        WHERE user_id = ? 
        `,
        [user],
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

function refresh(user, oldRefreshToken) {
  return new Promise(
    (resolve, reject) => {
      db.get(
        `SELECT count(*) as count FROM token
        WHERE user_id = ? AND token = ?
        `,
        [user, oldRefreshToken],
        (error, row) => {
          if (error) {
            reject(error);
            return;
          }
          if (row.count === 0) {
            reject(new ServiceError('User unauthorized'));
            return;
          }
          const accessToken = jwt.sign({ userId: user }, config.KEY);
          const refreshToken = uuid();
          db.run(
            `UPDATE token SET token = ?
            WHERE user_id = ? AND token = ?
            `,
            [refreshToken, user, oldRefreshToken],
            (updateError) => {
              if (updateError) {
                reject(updateError);
                return;
              }
              resolve({ accessToken, refreshToken });
            },
          );
        },
      );
    },
  );
}

module.exports = {
  signIn, signUp, logOut, refresh,
};
