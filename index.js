const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('todo.sqlite');
const app = express();

db.serialize(() => {
  db.run('CREATE TABLE lorem (info TEXT)');
});

db.close();

app.get('/', (_request, response) => {
  response.send('<h2>HELLO WORLD!</h2>');
});

app.listen(3000, undefined, () => {
  console.log('Server is online');
});
