const { Router } = require('express');
const authMiddleware = require('../../middlewares/auth');
const authService = require('../../services/auth');
const ServiceError = require('../../errors/service');

const router = Router();

router.post('/sign-in', async (request, response) => {
  const {
    email,
    password,
  } = request.body;
  try {
    const tokens = await authService.signIn(email, password);
    response.send(tokens);
  } catch (error) {
    if (error instanceof ServiceError) {
      response.status(403).send(error.message);
      return;
    }
    response.sendStatus(500);
  }
});

router.post('/sign-up', async (request, response) => {
  const {
    name,
    email,
    password,
  } = request.body;
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    response.status(400).json('name, email, password are required');
    return;
  }
  try {
    await authService.signUp(name, email, password);
    response.sendStatus(201);
  } catch (error) {
    if (error instanceof ServiceError) {
      response.status(400).send(error.message);
      return;
    }
    response.sendStatus(500);
  }
});

router.post('/log-out', authMiddleware, async (request, response) => {
  try {
    await authService.logOut(request.user);
    response.sendStatus(200);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

router.post('/refresh', authMiddleware, async (request, response) => {
  try {
    const tokens = await authService.refresh(request.user, request.body.refreshToken);
    response.send(tokens);
  } catch (error) {
    if (error instanceof ServiceError) {
      response.status(401).send(error.message);
      return;
    }
    response.sendStatus(500);
  }
});
module.exports = router;
