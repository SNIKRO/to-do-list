const express = require('express');
const db = require('../../db');

const router = express.Router();

// get all item by list id
router.get('/:id/items', (request, response) => {
  db.all('SELECT * FROM item WHERE list_id = ?', [request.params.id], (error, rows) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
      return;
    }
    response.send(rows);
  });
});
// get single item by id
router.get('/:listId/items/:itemID', (request, response) => {
  db.get('SELECT * FROM item WHERE id = ? AND list_id = ?', [request.params.itemID, request.params.listId], (error, row) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(404);
      return;
    }
    response.send(row);
  });
});
// create item
router.post('/:listId/items', (request, response) => {
  db.run('INSERT INTO item(description, list_id, status) VALUES (?, ?, ?)', [request.body.description, request.params.listId, request.body.status], function(error) {
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
      return;
    }
  });
  response.sendStatus(200);
});
// delete item by id
router.delete('/:listid/items/:itemId', (request, response) => {
  db.run('DELETE FROM items WHERE list_id = ?  AND id = ?', [request.params.listid, request.params.itemId], (error) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
      return;
    }
  });
  response.sendStatus(200);
});

module.exports = router;
