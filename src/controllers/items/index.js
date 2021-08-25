const express = require('express');
const db = require('../../db');

const router = express.Router();

// get all item by list id
router.get('/:id/items', (request, response) => {
  db.get('SELECT * FROM item WHERE list_id = ?', [request.params.id], (error, rows) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
      return;
    }
    response.send(rows);
  });
});


module.exports = router;
