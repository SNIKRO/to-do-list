const express = require('express');
const db = require('../../db');

const router = express.Router();
//прочитать все листы
router.get('/', (request, response) => {
  db.all('SELECT * FROM list', [], (error, rows) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
      return;
    }
    response.send(rows);
  });
});
//запрос листа по id
router.get('/:id', (request, response) => {
  db.get('SELECT * FROM list WHERE id = ?', [request.params.id], (error, row) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(404);
      return;
    }
    response.send(row);
  });
});
//создание нового листа
router.post('/create', (request, response) => {
  db.run('INSERT INTO list(name, user_id) VALUES (?, ?)', [request.body.name, request.body.user_id], (error) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(501);
      return;
    }
  });
  response.send('SUCCESS');
});
//изменение по id
router.put('/:id', (request, response) => {
  console.log(request.params.id);
  db.run('UPDATE list SET name = ? WHERE id = ?', [request.body.name, request.params.id], (error) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(501);
      return;
    }
  });
  response.send('List update!');
});
//удаление листа по id
router.delete('/:id', (request, response) => {
  db.run('DELETE FROM list WHERE id = ?', [request.params.id], (error) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(501);
      return;
    }
  });
  response.sendStatus(410);
});
module.exports = router;
