const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const parameters = require("../middleware/parameters");
const userDao = require("../daos/userDao");

module.exports = (app) => {
    app.put(
        "/users",
        [expressJwt(jwtSecret)],
        errors.asyncError(async (req, res, next) => {
            await userDao.updateUser(req.user.userId, req.body);
            res.status(200).send("Updated user");
        })
    );

    app.delete(
        "/users",
        [expressJwt(jwtSecret)],
        errors.asyncError(async (req, res, next) => {
            await userDao.deleteUser(req.user.userId);
            res.status(200).send("Deleted user");
        })
    );

    app.get(
        "/users/:userId",
        [parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            const user = await userDao.getUser(req.params.userId, false);

            res.status(200).send(user);
        })
    );

    app.get(
        "/users",
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await userDao.getAllUsers());
        })
    );
};
