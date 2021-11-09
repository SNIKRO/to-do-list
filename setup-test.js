require('./src/utils').loadEnv();

const dataBase = require('./src/db');

module.exports = async () => {
  await dataBase.initDb();
};
