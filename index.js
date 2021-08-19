const express = require('express');
const sqlite3 = require('sqlite3');

const app = express();
const db = new sqlite3.Database('todo.sqlite', (error) => {
  if (error) {
    return console.error(error.message);
  }
  console.log('Connected to the database.');
});

app.listen(3000, undefined, () => {
  console.log('Server is online');
});
db.close((error) => {
  if (error) {
    console.error(error.message);
  }
  console.log('Conection has be closed.');
});
