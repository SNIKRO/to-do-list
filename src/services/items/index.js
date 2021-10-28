const db = require('../../db');
const ServiceError = require('../../errors/service');

function getAllItemsById(userId, listId, limit, offset) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM item 
            INNER JOIN list ON item.list_id = list.id 
            WHERE item.list_id = ? AND list.user_id = ? 
            LIMIT ? OFFSET ? `,
      [userId, listId, limit, offset],
      (error, rows) => {
        if (error) {
          reject(error);
          return;
        }
        db.get(
          `SELECT Count(id) as total FROM item 
                INNER JOIN list ON item.list_id = list.id 
                WHERE item.list_id = ? AND list.user_id = ?`,
          [listId],
          (err, count) => {
            if (err) {
              reject(error);
              return;
            }
            resolve({
              rows,
              pagination: {
                limit,
                offset,
                total: count.total,
              },
            });
          },
        );
      },
    );
  });
}

function getSingleItemById(itemId, listId, userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM item 
            INNER JOIN list ON list.id = item.list_id
            WHERE item.id = ? AND item.list_id = ? AND list.user_id = ?`,
      [itemId, listId, userId],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        if (!row) {
          reject(new ServiceError('Not found'));
          return;
        }
        resolve(row);
      },
    );
  });
}

function createList(listId, userId, description) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM list WHERE id = ? AND user_id = ?', [listId, userId], (checkError, row) => {
      if (checkError) {
        reject(checkError);
        return;
      }
      if (!row) {
        reject(new ServiceError('Bad Request'));
        return;
      }
      db.run('INSERT INTO item(description, list_id) VALUES (?, ?)', [description, listId], function (error) {
        if (error) {
          reject(error);
          return;
        }
        resolve(this.lastID);
      });
    });
  });
}

function updateListById(itemId, listId, userId, status, description) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM item 
            INNER JOIN list ON list.id = item.list_id 
            WHERE item.id = ? AND item.list_id = ? AND list.user_id = ?`,
      [itemId, listId, userId],
      (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        if (!row) {
          reject(new ServiceError('Not found'));
          return;
        }
        db.run(
          'UPDATE item SET status = ?, description = ? WHERE id = ?',
          [status ?? row.status, description ?? row.description, itemId],
          (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          },
        );
      },
    );
  });
}

function deleteList(listId, itemId, userId) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM item 
            WHERE item.id IN (
              SELECT item.id
              FROM item
              INNER JOIN list ON item.list_id = list.id 
              WHERE item.list_id = ? AND item.id = ? AND list.user_id = ?
            )`,
      [listId, itemId, userId],
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
  getAllItemsById,
  getSingleItemById,
  updateListById,
  createList,
  deleteList,
};
