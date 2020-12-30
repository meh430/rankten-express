const express = require("express");
const cors = require("cors");

const sql = require("./sqlPromise");
const models = require("./models");
const routes = require("./routes/index");
const errors = require("./middleware/errorHandler");

const app = express();
const port = process.env.PORT ? process.env.PORT : 3000;

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use((req, res, next) => {
    console.log(req.method + ": " + req.originalUrl);
    console.log(req.body);
    next();
})

async function init() {
    try {
        const connection = await sql.getConnection();

        //await sql.query(connection, "DROP DATABASE rank_ten");
        //await sql.query(connection, "CREATE DATABASE IF NOT EXISTS rank_ten");
        //await sql.query(connection, "USE rank_ten");
        await models.initializeTables(connection);

        connection.release();

        app.get("/", (req, res) => {
            res.status(200).send({ message: "Hello World!" });
        });

        routes(app);
        app.use(errors.errorHandler);
    } catch (error) {
        console.log(error);
    }
}

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

init();
