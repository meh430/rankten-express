const config = require("./config").config;
const mysql = require("mysql");
const sql = require("./sqlPromise");
const models = require("./models");

// TODO: maybe move all this to app.js to ensure connection?

const connection = mysql.createConnection(config);

(async () => {
    try {
        await sql.connect(connection);
        await sql.query(connection, "CREATE DATABASE IF NOT EXISTS rank_ten");
        await sql.query(connection, "USE rank_ten");
        await models.initializeTables(connection);
        console.log(await sql.query(connection, "SHOW TABLES"));
        
    } catch (error) {
        console.log(error);
    }
})();

module.exports = connection;
