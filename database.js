const config = require("./config").config;
const mysql = require("mysql");
const sql = require("./sqlPromise");
const models = require("./models");

const connection = mysql.createConnection(config);

try {
    await sql.connect(connection);
    await sql.query(connection, "CREATE DATABASE IF NOT EXISTS rank_ten");
    await sql.query(connection, "USE rank_ten");
    await models.initializeTables(connection);
} catch (error) {
    console.log(error);
}

module.exports = connection;
