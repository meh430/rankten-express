const expressJwt = require("express-jwt");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const parameters = require("../middleware/parameters");
const userDao = require("../daos/userDao");

module.exports = (app) => {
    /* Updates user
    body schema: {
        password: string,
        bio: string,
        profilePic: string
    }
    */
    app.put(
        "/users",
        [expressJwt(jwtSecret)],
        errors.asyncError(async (req, res, next) => {
            await userDao.updateUser(req.user.userId, req.body);
            res.status(200).send("Updated user");
        })
    );

    // Deletes user
    app.delete(
        "/users",
        [expressJwt(jwtSecret)],
        errors.asyncError(async (req, res, next) => {
            await userDao.deleteUser(req.user.userId);
            res.status(200).send("Deleted user");
        })
    );

    // Gets user info
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
