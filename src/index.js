const express = require('express');
const bodyParser = require('body-parser');
const listRouter = require('./controllers/lists');
const itemRouter = require('./controllers/items');
const userRouter = require('./controllers/users');
const authRouter = require('./controllers/auth');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use('/', authRouter);
app.use('/', userRouter);
app.use('/lists', listRouter);
app.use('/lists', itemRouter);

app.listen(3000, undefined, () => {
  console.log('Server is online');
});
