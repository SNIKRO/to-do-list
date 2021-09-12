const { Router } = require('express');
const jwt = require('jsonwebtoken'); // access token
const { v4: uuid } = require('uuid');// refresh token
const config = require('../../../config.json');
const db = require('../../db');
const authMiddleware = require('../../middlewares/auth');
const authService = require('../../services/auth');
const ServiceError = require('../../errors/service');

const router = Router();

router.post('/sign-in', (request, response) => {
  const {
    email,
    password,
  } = request.body;
  authService.signIn(email, password).then((tokens) => {
    response.send(tokens);
  }).catch((error) => {
    if (error instanceof ServiceError) {
      response.status(403).send(error.message);
      return;
    }
    response.sendStatus(500);
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

  authService.signUp(name, email, password).then(() => {
    response.sendStatus(201);
  }).catch((error) => {
    if (error instanceof ServiceError) {
      response.status(400).send(error.message);
      return;
    }
    response.sendStatus(500);
  });
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
