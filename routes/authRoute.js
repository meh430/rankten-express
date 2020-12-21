const jwt = require("express-jwt");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const userDao = require("../daos/userDao");

module.exports = (app, connection) => {
    const errorMiddleWare = errors.errorMiddleWare(connection);

    app.post(
        "/signup",
        [errorMiddleWare.checkConnection, jwt(jwtSecret)],
        errorMiddleWare.asyncError(async (req, res, next) => {
            const createdId = await userDao.createUser(connection, req);
        })
    );
};
