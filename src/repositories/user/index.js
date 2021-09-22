const db = require('../../db');

function getUser(email) {
  return new Promise(
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

module.exports = { getUser };
