const express = require('express');
const db = require('../../db');

const router = express.Router();
// take all list
router.get('/', (request, response) => {
  const {
    limit = 25,
    offset = 0,
  } = request.query;

  db.all('SELECT * FROM list WHERE user_id = ? LIMIT ? OFFSET ? ', [1, limit, offset], (error, rows) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
      return;
    }
    db.get('SELECT Count(id) as total FROM list', [], (err, count) => {
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
          count,
        },
      });
    });
  });
});
// request list by id
router.get('/:id', (request, response) => {
  db.get('SELECT * FROM list WHERE id = ? AND user_id = ?', [request.params.id, 1], (error, row) => {
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
// create new list
router.post('/', (request, response) => {
  db.run('INSERT INTO list(name, user_id) VALUES (?, ?)', [request.body.name, request.body.user_id], function (error) {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
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
      response.sendStatus(500);
    }
  });
  response.sendStatus(200);
});
// delete list by id
router.delete('/:id', (request, response) => {
  db.run('DELETE FROM list WHERE id = ? AND user_id = ?', [request.params.id, 1], (error) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
    }
  });
  response.sendStatus(200);
});
module.exports = router;
