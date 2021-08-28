const { Router } = require('express');
const jwt = require('jsonwebtoken'); // access token
const { v4: uuid } = require('uuid');// refresh token
const bcrypt = require('bcrypt');
const db = require('../../db');

const router = Router();
/**
 * клиент должен передать логин и пароль
 * метод должен проверить что юзер с таким логином есть в базе и предоставленный пароль верный
 * если юзер нет или его пароль не соответвует ввденому, то вернуть 403
 * если юзер сущетсвует и пароль верный, то сгеренрировать пару аксестокен и рефреш токен
 * рефреш токен сохранить в базу с юзер ид который мы достали из базы по логину
 * вернуть на клиент пару аксес токен и рефреш токен
 */
router.post('/sign-in', (request, response) => {
  const {
    email,
    password,
  } = request.body;

  if (!email.trim()) {
    response.status(400).json('email can not be empty');
  }
  db.get(`SELECT id, password FROM user 
  WHERE email = ? `,
  [email],
  (error, row) => {
    if (error) {
      console.error(error.message);
      response.sendStatus(500);
      return;
    }

    if (!row.id
      || !bcrypt.compareSync(password, row.password)) {
      response.sendStatus(403);
      return;
    }

    if (row.id
      && bcrypt.compareSync(password, row.password)) {
      const accessToken = jwt.sign(row.id, 'SECRET');
      const refreshToken = uuid();
      db.run(`INSERT INTO token(user_id, token) 
      VALUES (?,?)`,
      [row.id, refreshToken], (err) => {
        if (err) {
          console.error(error.message);
          response.sendStatus(500);
          return;
        }
      });
      response.status(200).json({ accessToken, refreshToken });
    }
  });
});

module.exports = router;
