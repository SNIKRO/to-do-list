const jwt = require('jsonwebtoken'); // access token
const { v4: uuid } = require('uuid');// refresh token
const bcrypt = require('bcrypt');
const config = require('../../config.json');
const db = require('../db');
const ServiceError = require('../errors/service');

function getUser(request) {
  return new Promise(
    (resolve, reject) => {
      db.get(`SELECT id, password FROM user 
        WHERE email = ? `,
      [request.email],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        if (!row
            || !bcrypt.compareSync(request.password, row.password)) {
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

module.exports = { getUser };
