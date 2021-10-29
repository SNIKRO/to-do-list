const db = require('../../db');
const ServiceError = require('../../errors/service');

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

function createList(listName, userId) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO list(name, user_id)
           VALUES (?, ?)`,
      [listName, userId],
      function (error) {
        if (error) {
          reject(error);
          return;
        }
        resolve(this.lastID);
      },
    );
  });
}

function updateList(listName, listId, userId) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE list SET name = ?
      WHERE id = ? AND user_id = ?`,
      [listName, listId, userId],
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

function deleteList(listId, userId) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM list 
      WHERE id = ? AND user_id = ?`,
      [listId, userId],
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

function shareList(userId, listId, email) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM list
            WHERE user_id = ? AND id = ?
            `,
      [userId, listId],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        if (!row) {
          reject(new ServiceError('Forbidden'));
          return;
        }
        db.get(
          `SELECT id FROM user
                WHERE email = ?
                `,
          [email],
          (userError, userRow) => {
            if (userError) {
              reject(userError);
              return;
            }
            if (!userRow) {
              reject(new ServiceError('User not found'));
              return;
            }
            db.run(
              `INSERT INTO shared_list(user_id, list_id)
                    VALUES (?, ?) ON CONFLICT DO NOTHING
                    `,
              [userRow.id, listId],
              (insertError) => {
                if (insertError) {
                  reject(insertError);
                  return;
                }
                resolve();
              },
            );
          },
        );
      },
    );
  });
}

module.exports = {
  getListsByUserId,
  getListsCountByUserId,
  getListById,
  createList,
  updateList,
  deleteList,
  shareList,
};
