const poolConfig = require('./config').poolConfig;
const mysql = require('mysql');

const pool = mysql.createPool(poolConfig);

module.exports = pool;