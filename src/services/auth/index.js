const jwt = require('jsonwebtoken'); // access token
const { v4: uuid } = require('uuid');// refresh token
const bcrypt = require('bcrypt');
const config = require('../../../config.json');
const db = require('../../db');
const ServiceError = require('../../errors/service');
const userRepo = require('../../repositories/user');

function signIn(email, password) {
  return new Promise(
    (resolve, reject) => {
      const user = userRepo.getUser(email);
      if (!user
          || !bcrypt.compareSync(password, user.password)) {
        reject(new ServiceError('Pair email/password is incorrect'));
        return;
      }
      const accessToken = jwt.sign({ userId: user.id }, config.KEY);
      const refreshToken = uuid();
      db.run(`INSERT INTO token(user_id, token) 
          VALUES (?,?)`,
      [user.id, refreshToken], (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ accessToken, refreshToken });
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

function logOut(userId) {
  return new Promise(
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

function refresh(userId, oldRefreshToken) {
  return new Promise(
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
          const accessToken = jwt.sign({ userID: userId }, config.KEY);
          const refreshToken = uuid();
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
