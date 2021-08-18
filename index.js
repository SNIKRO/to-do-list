const express = require('express');

const app = express();

app.get('/', (_request, response) => {
  response.send('<h2>HELLO WORLD!</h2>');
});

app.listen(3000, undefined, () => {
  console.log('Server is online');
});
