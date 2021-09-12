const express = require('express');
const db = require('../../db');

const router = express.Router();
// take all list
router.get('/', (request, response) => {
  const {
    limit = 25,
    offset = 0,
  } = request.query;

  db.all('SELECT * FROM list WHERE user_id = ? LIMIT ? OFFSET ? ', [request.user, limit, offset], (error, rows) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
      return;
    }
    db.get('SELECT Count(id) as total FROM list WHERE user_id = ?', [request.user], (err, count) => {
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
    });
  });
});
// request list by id
router.get('/:id', (request, response) => {
  db.get('SELECT * FROM list WHERE id = ? AND user_id = ?', [request.params.id, request.user], (error, row) => {
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
  db.run('INSERT INTO list(name, user_id) VALUES (?, ?)',
    [request.body.name, request.user],
    function (error) {
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
  db.run('UPDATE list SET name = ? WHERE id = ? AND user_id = ?', [request.body.name, request.params.id, request.user], (error) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
      return;
    }
    response.sendStatus(200);
  });
});
// delete list by id
router.delete('/:id', (request, response) => {
  db.run('DELETE FROM list WHERE id = ? AND user_id = ?', [request.params.id, request.user], (error) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
      return;
    }
    response.sendStatus(200);
  });
});
// shared list
router.post('/:listId/share', (request, response) => {
  db.get(
    `SELECT id FROM list
    WHERE user_id = ? AND id = ?
    `,
    [request.user, request.params.listId],
    (error, row) => {
      if (error) {
        console.error(error.message);
        response.sendStatus(500);
        return;
      }
      if (!row) {
        response.sendStatus(403);
        return;
      }
      db.get(
        `SELECT id FROM user
        WHERE email = ?
        `,
        [request.body.email],
        (userError, userRow) => {
          if (userError) {
            console.error(userError.message);
            response.sendStatus(500);
            return;
          }
          if (!userRow) {
            response.status(404).send('User not found');
            return;
          }
          db.run(
            `INSERT INTO shared_list(user_id, list_id)
            VALUES (?, ?) ON CONFLICT DO NOTHING
            `,
            [userRow.id, request.params.listId],
            (insertError) => {
              if (insertError) {
                console.error(insertError.message);
                response.sendStatus(500);
                return;
              }
              response.send('List is shared to user');
            },
          );
        },
      );
    },
  );
});
module.exports = router;
