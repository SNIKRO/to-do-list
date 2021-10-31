const db = require('../../db');

function getAllItemsByUserIdAndListId(userId, listId, limit, offset) {
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
        resolve(rows);
      },
    );
  });
}

function getItemsCountByUserIdAndListId(listId, userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT Count(id) as total FROM item 
            INNER JOIN list ON item.list_id = list.id 
            WHERE item.list_id = ? AND list.user_id = ?`,
      [listId, userId],
      (error, count) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(count.total);
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
        resolve(row);
      },
    );
  });
}

function listIdExistCheck(listId, userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM list WHERE id = ? AND user_id = ?', [listId, userId], (checkError, row) => {
      if (checkError) {
        reject(checkError);
        return;
      }
      resolve(row);
    });
  });
}

function insertNewItem(description, listId) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO item(description, list_id) VALUES (?, ?)', [description, listId], function (error) {
      if (error) {
        reject(error);
        return;
      }
      resolve(this.lastID);
    });
  });
}

function updateItemById(status, description, itemId) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE item SET status = ?, description = ? WHERE id = ?', [status, description, itemId], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function deleteItem(listId, itemId, userId) {
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

function insertMultipleItems(items, listId) {
  return new Promise((resolve, reject) => {
    const preparedItems = [];
    items.forEach((item) => {
      preparedItems.push(item.description);
      preparedItems.push(listId);
    });
    const itemPlaceholders = new Array(items.length).fill('(?, ?)').join(',');
    db.run(`INSERT INTO item(description, list_id) VALUES ${itemPlaceholders}`, [...preparedItems], (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

module.exports = {
  getAllItemsByUserIdAndListId,
  getItemsCountByUserIdAndListId,
  getSingleItemById,
  listIdExistCheck,
  insertNewItem,
  insertMultipleItems,
  updateItemById,
  deleteItem,
};
