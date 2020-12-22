const expressJwt = require("express-jwt");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const parameters = require("../middleware/parameters");
const userDao = require("../daos/userDao");

module.exports = (app) => {
    // Follows or unfollows user
    app.post(
        "/follow/:userId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            const result = await userDao.follow(req.user.userId, req.params.userId);

            res.status(200).send({ message: result });
        })
    );

    // Returns everyone a user is following
    app.get(
        "/following/:userId",
        [parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await userDao.getFollowing(req.params.userId));
        })
    );

    // Returns the followers of a user
    app.get(
        "/followers/:userId",
        [parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await userDao.getFollowers(req.params.userId));
        })
    );
};
