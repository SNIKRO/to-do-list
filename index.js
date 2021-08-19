const express = require('express');

const app = express();

app.listen(3000, undefined, () => {
  console.log('Server is online');
});
