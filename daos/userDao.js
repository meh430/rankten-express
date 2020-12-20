const bcrypt = require("bcryptjs");
const queries = require("../queries");
const sql = require("../models/sqlPromise");
const errors = require("../middleware/errorHandler");

const namePattern = /^[a-z0-9_-]{3,15}$/g;
const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/g;

async function createUser(connection, user) {
    delete user.userId;
    delete user.dateCreated;
    delete user.rankPoints;

    if (!user.username.match(namePattern) || !user.password.match(passwordPattern)) {
        throw errors.invalidCredentialsError();
    }

    user.password = bcrypt.hashSync(user.password);

    const res = await sql.query(connection, queries.createUserQuery(user));
    console.log(res);
    return res.insertId;
}

