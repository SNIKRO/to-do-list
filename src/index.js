const express = require('express');
const bodyParser = require('body-parser');
const listRouter = require('./controllers/lists');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/lists', listRouter);

app.listen(3000, undefined, () => {
  console.log('Server is online');
});
