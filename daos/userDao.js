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

async function updateUser(connection, userId, user) {
    delete user.userId;
    delete user.dateCreated;
    delete user.rankPoints;

    if ('password' in user) {
        user.password = bcrypt.hashSync(user.password);
    }

    const res = await sql.query(connection, queries.updateUserQuery(userId, user));
    console.log(res);

    if (res.affectedRows === 0) {
        throw errors.notFoundError();
    }
}

async function deleteUser(connection, userId) {
    const res = await sql.query(connection, queries.deleteUserQuery(userId));
    console.log(res);

    if (res.dateCreated === 0) {
        throw errors.notFoundError();
    }
}

async function getUser(connection, user, private) {
    return "TODO";
}