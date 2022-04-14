const Sequelize = require('sequelize');

const dbConfig = {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: 0,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

module.exports = new Sequelize(
  process.env.DB,
  'root',
  process.env.DB_PASSWORD,
  dbConfig
);
