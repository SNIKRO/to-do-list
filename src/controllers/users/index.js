const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../../db');

const router = express.Router();
// registrate user
router.post('/sign-up', (request, response) => {
  const {
    name,
    email,
    password,
  } = request.body;
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    response.status(400).json('name, email, password are required');
    return;
  }
  db.get(
    `SELECT id FROM user
    WHERE email = ?`,
    [email],
    (error, row) => {
      if (error) {
        console.error(error);
        response.sendStatus(500);
        return;
      }
      if (row) {
        response.status(400).send('email has been taken');
        return;
      }
      db.run(
        'INSERT INTO user(name, email, password) VALUES (?, ?, ?)',
        [
          name,
          email,
          bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
        ],
        (insertionError) => {
          if (insertionError) {
            console.error(insertionError);
            response.sendStatus(500);
            return;
          }
          response.sendStatus(201);
        },
      );
    },
  );
});

module.exports = router;
