const db = require('../../db');

async function insertToken(userId, refreshToken) {
  await new Promise((resolve, reject) => {
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
  });
}

async function getTokenCount(userId, oldRefreshToken) {
  await new Promise((resolve, reject) => {
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
        resolve(row.count);
      },
    );
  });
}

async function refreshUserToken(userId, oldRefreshToken, refreshToken) {
  await new Promise((resolve, reject) => {
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
  });
}
async function deleteTokenByUserId(userId) {
  await new Promise((resolve, reject) => {
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
  });
}

module.exports = {
  insertToken,
  refreshUserToken,
  getTokenCount,
  deleteTokenByUserId,
};
