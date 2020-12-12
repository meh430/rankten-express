const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Hello World!");
});

mongoose.connect("mongodb://localhost:27017/express", { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });
});
