const db = require('../../db');

function getListsByUserId(userId, limit, offset) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM list 
        WHERE user_id = ? LIMIT ? OFFSET ? `,
      [userId, limit, offset],
      (error, rows) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(rows);
      },
    );
  });
}

function getListsCountByUserId(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT Count(id) as total FROM list
      WHERE user_id = ?`,
      [userId],
      (err, count) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(count.total);
      },
    );
  });
}

function getListById(listId, userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM list
          WHERE id = ? AND user_id = ?`,
      [listId, userId],
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
module.exports = {
  getListsByUserId,
  getListsCountByUserId,
  getListById,
};
