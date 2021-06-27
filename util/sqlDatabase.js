const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-online-shop', 'root' , '123456',{
  dialect: 'mysql'
});

module.exports = sequelize;


/*
without sequelize uitility: 
const sql = require("mysql2");
const pool = sql.createPool({
  host: "localhost",
  user: "root",
  database: "node-online-shop",
  password: "123456"
});

module.exports = pool.promise();
*/