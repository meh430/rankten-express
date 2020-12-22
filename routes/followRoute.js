const expressJwt = require("express-jwt");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const parameters = require("../middleware/parameters");
const userDao = require("../daos/userDao");

module.exports = (app) => {
    app.post(
        "/follow/:userId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            const result = await userDao.follow(req.user.userId, req.params.userId);

            res.status(200).send({ message: result });
        })
    );

    app.get(
        "/following/:userId",
        [parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await userDao.getFollowing(req.params.userId));
        })
    );

    app.get(
        "/followers/:userId",
        [parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await userDao.getFollowers(req.params.userId));
        })
    );
};
