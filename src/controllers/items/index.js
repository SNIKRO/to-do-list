const { response } = require('express');
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
router.get('/:id/items/:itemID', (request, response) => {
  db.get('SELECT * FROM item WHERE id = ? AND list_id = ?', [request.params.itemID, request.params.id], (error, row) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(404);
      return;
    }
    response.send(row);
  });
});
// create item
router.post('/:id/items', (request, response) => {
  db.run('INSERT INTO item(description, list_id) VALUES (?, ?)', [request.body.description, request.params.id], (error) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(501);
      return;
    }
    response.status(201).send(this.lastId);
  });
});

module.exports = router;
