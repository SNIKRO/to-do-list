const { Router } = require('express');
const jwt = require('jsonwebtoken'); // access token
const { v4: uuid } = require('uuid');// refresh token
const bcrypt = require('bcrypt');
const config = require('../../../config.json');
const db = require('../../db');
const authMiddleware = require('../../middlewares/auth');

const router = Router();

router.post('/sign-in', (request, response) => {
  const {
    email,
    password,
  } = request.body;

  db.get(`SELECT id, password FROM user 
  WHERE email = ? `,
  [email],
  (error, row) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
      return;
    }
    console.log(row);
    if (!row
      || !bcrypt.compareSync(password, row.password)) {
      response.sendStatus(403);
      return;
    }

    const accessToken = jwt.sign({ userId: row.id }, config.KEY);
    const refreshToken = uuid();
    db.run(`INSERT INTO token(user_id, token) 
      VALUES (?,?)`,
    [row.id, refreshToken], (err) => {
      if (err) {
        console.error(err.message);
        response.sendStatus(500);
      }
      response.status(200).json({ accessToken, refreshToken });
    });
  });
});

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

router.post('/log-out', authMiddleware, (request, response) => {
  db.run(
    `DELETE FROM token 
    WHERE user_id = ? 
    `,
    [request.user],
    (error) => {
      if (error) {
        console.log(error.message);
        response.sendStatus(500);
        return;
      }
      response.sendStatus(200);
    },
  );
});

router.post('/refresh', authMiddleware, (request, response) => {
  db.get(
    `SELECT count(*) as count FROM token
    WHERE user_id = ? AND token = ?
    `,
    [request.user, request.body.refreshToken],
    (error, row) => {
      if (error) {
        console.log(error.message);
        response.sendStatus(500);
        return;
      }
      if (row.count === 0) {
        response.sendStatus(401);
        return;
      }
      const accessToken = jwt.sign({ userId: request.user }, config.KEY);
      const refreshToken = uuid();
      db.run(
        `UPDATE token SET token = ?
        WHERE user_id = ? AND token = ?
        `,
        [refreshToken, request.user, request.body.refreshToken],
        (updateError) => {
          if (updateError) {
            console.log(updateError.message);
            response.sendStatus(500);
            return;
          }
          response.send({ accessToken, refreshToken });
        },
      );
    },
  );
});
module.exports = router;
