const jwt = require('jsonwebtoken'); // access token
const { v4: uuid } = require('uuid');// refresh token
const bcrypt = require('bcrypt');
const config = require('../../../config.json');
const db = require('../../db');
const ServiceError = require('../../errors/service');
const userRepo = require('../../repositories/user');

function signIn(email, password) {
  return new Promise(
    (resolve, reject) => {
      const user = userRepo.getUser(email);
      if (!user
          || !bcrypt.compareSync(password, user.password)) {
        reject(new ServiceError('Pair email/password is incorrect'));
        return;
      }
      const accessToken = jwt.sign({ userId: user.id }, config.KEY);
      const refreshToken = uuid();

      userRepo.insertToken(user.id, refreshToken);
      resolve({ accessToken, refreshToken });
    },
  );
}

function signUp(email, password) {
  return new Promise(
    (resolve, reject) => { // reject needed here?
      const user = userRepo.getUser(email);
      userRepo.insertUser(user.name, email, password);
      resolve();
    },
  );
}

function logOut(userId) {
  return new Promise(
    (resolve, reject) => {
      userRepo.deleteUser(userId);
      resolve();
    },
  );
}

function refresh(userId, oldRefreshToken) {
  return new Promise(
    (resolve, reject) => {
      const accessToken = jwt.sign({ userID: userId }, config.KEY);
      const refreshToken = uuid();
      userRepo.refreshUserToken(userId, oldRefreshToken, accessToken, refreshToken);
      resolve({ accessToken, refreshToken });
    },
  );
}

module.exports = {
  signIn, signUp, logOut, refresh,
};
