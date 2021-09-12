const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('todo.sqlite', (error) => {
  if (error) {
    throw error;
  }

  db.run(`CREATE TABLE IF NOT EXISTS user ( 
    id integer primary key,
    name text not null,
    email text UNIQUE not null,
    password text not null
  ) `, (userError) => {
    if (userError) {
      console.error(userError.message);
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS token(
    user_id integer not null,
    token text UNIQUE not null,
    FOREIGN KEY (user_id) REFERENCES user(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS list ( 
    id integer primary key,
    name text not null,
    user_id integer,
    FOREIGN KEY(user_id) REFERENCES user(id)
  ) `, (listError) => {
    if (listError) {
      console.error(listError.message);
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS item ( 
    id integer primary key,
    description text not null,
    status integer check (status BETWEEN 0 AND 1) default (0) not null,
    list_id integer,
    FOREIGN KEY(list_id) REFERENCES list(id)
  ) `, (itemError) => {
    if (itemError) {
      console.error(itemError.message);
    }
  });
  console.log('Connected to the database.');
});

module.exports = db;
