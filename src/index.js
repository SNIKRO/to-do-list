const express = require('express');
const listRouter = require('./controllers/lists');

const app = express();

app.use('/lists', listRouter);

app.listen(3000, undefined, () => {
  console.log('Server is online');
});
