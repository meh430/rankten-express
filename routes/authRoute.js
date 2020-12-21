const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const userDao = require("../daos/userDao");

module.exports = (app, connection) => {
    const errorMiddleWare = errors.errorMiddleWare(connection);

    app.post(
        "/signup",
        [errorMiddleWare.checkConnection],
        errorMiddleWare.asyncError(async (req, res, next) => {
            console.log(req.body);
            if (await userDao.userExists(connection, req.body.username)) {
                throw errors.badRequest();
            }

            const createdId = await userDao.createUser(connection, req.body);
            const token = jwt.sign({ userId: createdId }, jwtSecret.secret, { expiresIn: 7 * 24 * 60 * 60 });
            
            const createdUser = await userDao.getUser(connection, createdId, true);
            createdUser.jwtToken = token;

            res.status(200).send(createdUser);
        })
    );
};
