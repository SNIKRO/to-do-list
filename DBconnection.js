const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('todo.sqlite', (error) => {
  if (error) {
    return console.error(error.message);
  }
  console.log('Connected to the database.');
});

module.exports = db;
