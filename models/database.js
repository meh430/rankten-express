const config = require("../config").config;
const mysql = require('mysql');
const connection = mysql.createConnection(config);

connection.connect(err => {
    if (err) throw console.log(err);

    console.log("Connected");
    connection.query("CREATE DATABASE IF NOT EXISTS rank_ten;", (err) => console.log(err ? err : "1"));
    connection.query("USE rank_ten", (err) => console.log(err ? err : "2"));
    connection.query("CREATE TABLE IF NOT EXISTS employee_table(id int NOT NULL AUTO_INCREMENT, name varchar(45) NOT NULL, occupation varchar(35) NOT NULL, age int NOT NULL, PRIMARY KEY (id));", (err) => {
        console.log(err);
    });
})


module.exports = connection;