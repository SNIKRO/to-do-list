const sqlite3 = require('sqlite3').verbose();

class DataBase {
  getConnection() {
    return this.db;
  }

  initDb() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(process.env.DATA_BASE_NAME, (error) => {
        if (error) {
          reject(error);
        }
        const createUsers = new Promise((resolveUser, rejectUser) => {
          this.db.run(
            `CREATE TABLE IF NOT EXISTS user ( 
            id integer primary key,
            name text not null,
            email text UNIQUE not null,
            password text not null
          ) `,
            (userError) => {
              if (userError) {
                rejectUser(userError);
                return;
              }
              resolveUser();
            },
          );
        });
        resolve(Promise.all([createUsers]));
      });
    });
  }
}

module.exports = new DataBase();
// const db = new sqlite3.Database(process.env.DATA_BASE_NAME, (error) => {
//   if (error) {
//     throw error;
//   }

//   // db.run(
//   //   `CREATE TABLE IF NOT EXISTS user (
//   //   id integer primary key,
//   //   name text not null,
//   //   email text UNIQUE not null,
//   //   password text not null
//   // ) `,
//   //   (userError) => {
//   //     if (userError) {
//   //       console.error(userError.message);
//   //     }
//   //   },
//   // );

//   db.run(`CREATE TABLE IF NOT EXISTS token(
//     user_id integer not null,
//     token text UNIQUE not null,
//     FOREIGN KEY (user_id) REFERENCES user(id)
//   )`);

//   db.run(
//     `CREATE TABLE IF NOT EXISTS list (
//     id integer primary key,
//     name text not null,
//     user_id integer,
//     FOREIGN KEY(user_id) REFERENCES user(id)
//   ) `,
//     (listError) => {
//       if (listError) {
//         console.error(listError.message);
//       }
//     },
//   );

//   db.run(
//     `CREATE TABLE IF NOT EXISTS item (
//     id integer primary key,
//     description text not null,
//     status integer check (status BETWEEN 0 AND 1) default (0) not null,
//     list_id integer,
//     FOREIGN KEY(list_id) REFERENCES list(id)
//   ) `,
//     (itemError) => {
//       if (itemError) {
//         console.error(itemError.message);
//       }
//     },
//   );

//   db.run(`CREATE TABLE IF NOT EXISTS shared_list (
//     user_id integer not null,
//     list_id integer not null,
//     FOREIGN KEY(user_id) REFERENCES user(id),
//     FOREIGN KEY(list_id) REFERENCES list(id),
//     UNIQUE(user_id, list_id)
//   )`);
//   console.log('Connected to the database.');
// });

// module.exports = db;
