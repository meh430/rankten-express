const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const userDao = require("../daos/userDao");

module.exports = (app) => {
    app.post(
        "/follow/:userId",
        [expressJwt(jwtSecret)],
        errors.asyncError(async (req, res, next) => {
            const result = await userDao.follow(req.user.userId, req.params.userId);

            res.status(200).send({ message: result });
        })
    );

    app.get(
        "/following/:userId",
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await userDao.getFollowing(req.params.userId));
        })
    );

    app.get(
        "/followers/:userId",
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await userDao.getFollowers(req.params.userId));
        })
    );
};
