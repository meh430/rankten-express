const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

const sqlConfig = require("./config").sqlConfig;
const sql = require("./sqlPromise");
const models = require("./models");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

const authRoutes = require("./routes/authRoute");

var connection;

async function init() {
    try {
        connection = mysql.createConnection(sqlConfig);

        await sql.connect(connection);

        connection.on("error", (error) => {
            console.log("db error", error);
            if (error.code === "PROTOCOL_CONNECTION_LOST") {
                setTimeout(init, 15000);
            } else {
                throw error;
            }
        });

        await sql.query(connection, "DROP DATABASE rank_ten");
        await sql.query(connection, "CREATE DATABASE IF NOT EXISTS rank_ten");
        await sql.query(connection, "USE rank_ten");
        await models.initializeTables(connection);
        console.log(await sql.query(connection, "SHOW TABLES"));

        app.get("/", (req, res) => {
            res.status(200).send({ message: "Hello World!" });
        });

        authRoutes(app, connection);
    } catch (error) {
        console.log(error);
        setTimeout(init, 15000);
    }
}

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

init();
