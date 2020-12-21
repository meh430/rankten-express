const express = require("express");
const cors = require("cors");

const sql = require("./sqlPromise");
const models = require("./models");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

const authRoutes = require("./routes/authRoute");

async function init() {
    try {
        const connection = await sql.getConnection();

        //await sql.query(connection, "DROP DATABASE rank_ten");
        await sql.query(connection, "CREATE DATABASE IF NOT EXISTS rank_ten");
        await sql.query(connection, "USE rank_ten");
        await models.initializeTables(connection);
        console.log(await sql.query(connection, "SHOW TABLES"));

        connection.release();

        app.get("/", (req, res) => {
            res.status(200).send({ message: "Hello World!" });
        });

        authRoutes(app);
    } catch (error) {
        console.log(error);
    }
}

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

init();
