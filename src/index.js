require('./utils').loadEnv();

const express = require('express');
const bodyParser = require('body-parser');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const cors = require('cors');
const multer = require('multer');
const passport = require('passport');
const listRouter = require('./controllers/lists');
const itemRouter = require('./controllers/items');
const authRouter = require('./controllers/auth');
const authMiddleware = require('./middlewares/auth');
const dataBase = require('./db');

const app = express();
const upload = multer();

app.use(cors());

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.KEY,
};
passport.use(
  new JwtStrategy(opts, (jwtPayload, done) => {
    if (!jwtPayload.userId) {
      done(new Error('User does not exist'));
      return;
    }
    done(null, jwtPayload.userId);
  }),
);

app.use(bodyParser.json());

app.use('/', upload.array(), authRouter);
app.use('/lists', authMiddleware, listRouter);
app.use('/lists', authMiddleware, itemRouter);

async function runApp() {
  await dataBase.initDb();
  console.log('Data base is connected');
  app.listen(5000, undefined, () => {
    console.log('Server is online');
  });
}
runApp();
