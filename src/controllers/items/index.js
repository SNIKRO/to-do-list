const express = require('express');
const db = require('../../db');

const router = express.Router();

// get all item by list id
router.get('/:listId/items', (request, response) => {
  const {
    limit = 25,
    offset = 0,
  } = request.query;

  db.all(
    'SELECT * FROM item INNER JOIN list ON item.list_id = list.id WHERE item.list_id = ? AND list.user_id = ? LIMIT ? OFFSET ? ',
    [1, request.params.listId, limit, offset],
    (error, rows) => {
      if (error) {
        console.error(error.message);
        response.sendStatus(500);
        return;
      }
      db.get(
        'SELECT Count(id) as total FROM item INNER JOIN list ON item.list_id = list.id WHERE item.list_id = ? AND list.user_id = ?',
        [request.params.listId],
        (err, count) => {
          if (err) {
            console.error(error.message);
            response.sendStatus(500);
            return;
          }
          response.send({
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
// get single item by id
router.get('/:listId/items/:itemID', (request, response) => {
  db.get('SELECT * FROM item WHERE id = ? AND list_id = ?', [request.params.itemID, request.params.listId], (error, row) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
      return;
    }
    if (row === undefined) {
      response.sendStatus(404);
      return;
    }
    response.send(row);
  });
});
// create item
router.post('/:listId/items', (request, response) => {
  db.run('INSERT INTO item(description, list_id) VALUES (?, ?)', [request.body.description, request.params.listId], function (error) {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
      return;
    }
    response.status(200).json(this.lastID);
  });
});
// update item by id
router.put('/:listId/items/:itemId', (request, response) => {
  db.run('UPDATE item SET status = ?, description = ? WHERE list_id = ? AND id = ?', [request.body.status, request.body.description, request.params.listId, request.params.itemId], (error) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
    }
  });
  response.sendStatus(200);
});
// delete item by id
router.delete('/:listId/items/:itemId', (request, response) => {
  db.run('DELETE FROM items WHERE list_id = ?  AND id = ?', [request.params.listId, request.params.itemId], (error) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
    }
  });
  response.sendStatus(200);
});

module.exports = router;
