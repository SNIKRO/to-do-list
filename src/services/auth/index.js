const jwt = require('jsonwebtoken'); // access token
const { v4: uuid } = require('uuid'); // refresh token
const bcrypt = require('bcrypt');
const config = require('../../../config.json');
const ServiceError = require('../../errors/service');
const userRepo = require('../../repositories/user');
const tokenRepo = require('../../repositories/token');

async function signIn(email, password) {
  const user = await userRepo.getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new ServiceError('Pair email/password is incorrect');
  }
  const accessToken = jwt.sign({ userId: user.id }, config.KEY);
  const refreshToken = uuid();

  tokenRepo.insertToken(user.id, refreshToken);
  return { accessToken, refreshToken };
}

async function signUp(name, email, password) {
  const user = await userRepo.getUserByEmail(email);
  if (user) {
    throw new ServiceError('Email has been taken');
  }
  await userRepo.insertUser(name, email, password);
}

async function logOut(userId) {
  await tokenRepo.deleteTokenByUserId(userId);
}

async function refreshTokensPair(userId, oldRefreshToken) {
  const accessToken = jwt.sign({ userID: userId }, config.KEY);
  const refreshToken = uuid();
  const tokenExists = !!(await tokenRepo.getTokenCount(userId, oldRefreshToken));
  if (!tokenExists) {
    throw new ServiceError('User unauthorized');
  }
  await tokenRepo.refreshUserToken(userId, oldRefreshToken, accessToken, refreshToken);
  return { accessToken, refreshToken };
}

module.exports = {
  signIn,
  signUp,
  logOut,
  refreshTokensPair,
};
