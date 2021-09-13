const { Router } = require('express');
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
  authService.logOut(request.user).then(() => {
    response.sendStatus(200);
  }).catch((error) => {
    if (error instanceof ServiceError) {
      response.status(400).send(error.message); // what mistake should there be and should it?
      return;
    }
    response.sendStatus(500);
  });
});

router.post('/refresh', authMiddleware, (request, response) => {
  authService.refresh(request.user, request.body.refreshToken).then((tokens) => {
    response.send(tokens);
  }).catch((error) => {
    if (error instanceof ServiceError) {
      response.status(401).send(error.message);
      return;
    }
    response.sendStatus(500);
  });
});
module.exports = router;
