const dataBase = require('../../db');

function getListsByUserId(userId, limit, offset) {
  const db = dataBase.getConnection();
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
  const db = dataBase.getConnection();
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
  const db = dataBase.getConnection();
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
  const db = dataBase.getConnection();
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
  const db = dataBase.getConnection();
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
  const db = dataBase.getConnection();
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

function shareList(userId, listId) {
  const db = dataBase.getConnection();
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO shared_list(user_id, list_id)
                    VALUES (?, ?) ON CONFLICT DO NOTHING
                    `,
      [userId, listId],
      (insertError) => {
        if (insertError) {
          reject(insertError);
          return;
        }
        resolve();
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
