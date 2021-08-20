const express = require('express');
const db = require('../../db');

const router = express.Router();

router.get('/', (request, response) => {
  db.all('SELECT * FROM list WHERE user_id = ?', [1], (error, rows) => {
    if (error) {
      response.sendStatus(500);
      return;
    }
    response.send(rows);
  });
});

module.exports = router;
