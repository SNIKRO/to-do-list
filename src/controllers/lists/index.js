const express = require('express');
const db = require('../../db');

const router = express.Router();
// take all list
router.get('/', (request, response) => {
  db.all('SELECT * FROM list WHERE user_id = ?', [1], (error, rows) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
      return;
    }
    response.send(rows);
  });
});
// request list by id
router.get('/:id', (request, response) => {
  db.get('SELECT * FROM list WHERE id = ? AND user_id = ?', [request.params.id, 1], (error, row) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(404);
      return;
    }
    response.send(row);
  });
});
// create new list
router.post('/', (request, response) => {
  db.run('INSERT INTO list(name, user_id) VALUES (?, ?)', [request.body.name, request.body.user_id], function(error) {
    if (error) {
      console.error(error.message);
      response.sendStatus(501);
      return;
    }
    response.status(201).json(this.lastID);
  });
});
// change list by id
router.put('/:id', (request, response) => {
  db.run('UPDATE list SET name = ? WHERE id = ? AND user_id = ?', [request.body.name, request.params.id, 1], (error) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(501);
    }
  });
  response.send('List update!');
});
// delete list by id
router.delete('/:id', (request, response) => {
  db.run('DELETE FROM list WHERE id = ? AND user_id = ?', [request.params.id, 1], (error) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(501);
    }
  });
  response.sendStatus(410);
});
module.exports = router;
