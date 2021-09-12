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
    `SELECT * FROM item 
    INNER JOIN list ON item.list_id = list.id 
    WHERE item.list_id = ? AND list.user_id = ? 
    LIMIT ? OFFSET ? `,
    [request.user, request.params.listId, limit, offset],
    (error, rows) => {
      if (error) {
        console.error(error.message);
        response.sendStatus(500);
        return;
      }
      db.get(
        `SELECT Count(id) as total FROM item 
        INNER JOIN list ON item.list_id = list.id 
        WHERE item.list_id = ? AND list.user_id = ?`,
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
  db.get(
    `SELECT * FROM item 
    INNER JOIN list ON list.id = item.list_id
    WHERE item.id = ? AND item.list_id = ? AND list.user_id = ?`,
    [request.params.itemID, request.params.listId, request.user],
    (error, row) => {
      if (error) {
        console.error(error.message);
        response.sendStatus(500);
        return;
      }
      if (!row) {
        response.sendStatus(404);
        return;
      }
      response.send(row);
    },
  );
});
// create item
router.post('/:listId/items', (request, response) => {
  db.get('SELECT id FROM list WHERE id = ? AND user_id = ?',
    [request.params.listId, request.user],
    (checkError, row) => {
      if (checkError) {
        console.error(checkError.message);
        response.sendStatus(500);
        return;
      }
      if (!row) {
        response.sendStatus(400);
        return;
      }
      db.run('INSERT INTO item(description, list_id) VALUES (?, ?)',
        [request.body.description, request.params.listId],
        function (error) {
          if (error) {
            console.error(error.message);
            response.sendStatus(500);
            return;
          }
          response.status(200).json(this.lastID);
        });
    });
});
// update item by id
router.put('/:listId/items/:itemId', (request, response) => {
  db.get(
    `SELECT * FROM item 
    INNER JOIN list ON list.id = item.list_id 
    WHERE item.id = ? AND item.list_id = ? AND list.user_id = ?`,
    [request.params.itemId, request.params.listId, request.user],
    (error, row) => {
      if (error) {
        console.error(error.message);
        response.sendStatus(500);
        return;
      }
      if (!row) {
        response.sendStatus(404);
        return;
      }
      db.run('UPDATE item SET status = ?, description = ? WHERE id = ?',
        [
          request.body.status ?? row.status,
          request.body.description ?? row.description,
          request.params.itemId,
        ],
        (err) => {
          if (err) {
            console.error(error.message);
            response.sendStatus(500);
          }
          response.sendStatus(200);
        });
    },
  );
});
// delete item by id
router.delete('/:listId/items/:itemId', (request, response) => {
  db.run(
    `DELETE FROM item 
    WHERE item.id IN (
      SELECT item.id
      FROM item
      INNER JOIN list ON item.list_id = list.id 
      WHERE item.list_id = ? AND item.id = ? AND list.user_id = ?
    )`,
    [request.params.listId, request.params.itemId, request.user],
    (error) => {
      if (error) {
        console.error(error.message);
        response.sendStatus(500);
      }
      response.sendStatus(200);
    },
  );
});

module.exports = router;
