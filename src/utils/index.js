const dotenv = require('dotenv');
const path = require('path');

function loadEnv() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const configPath = path.resolve(`.env.${nodeEnv}`);
  dotenv.config({ path: configPath });
}

module.exports = {
  loadEnv,
};
