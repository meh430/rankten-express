const config = require("../config").config;
const mysql = require('mysql');
const connection = mysql.createConnection(config);

connection.connect(error => {
    if (error) throw error;

    console.log("Connected");
})

module.exports = connection;