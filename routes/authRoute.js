const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const bcrypt = require("bcryptjs");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const userDao = require("../daos/userDao");

const tokenExpiry = { expiresIn: 7 * 24 * 60 * 60 };

module.exports = (app) => {
    app.post(
        "/signup",
        errors.asyncError(async (req, res, next) => {
            console.log(req.body);
            if (await userDao.getUserWithName(req.body.username)) {
                throw errors.badRequest();
            }

            const createdId = await userDao.createUser(req.body);
            const token = jwt.sign({ userId: createdId }, jwtSecret.secret, tokenExpiry);

            const createdUser = await userDao.getUser(createdId, true);
            createdUser.jwtToken = token;

            res.status(200).send(createdUser);
        })
    );

    app.post(
        "/login",
        errors.asyncError(async (req, res, next) => {
            const userPass = await userDao.getUserWithName(req.body.username);
            if (!userPass) {
                throw errors.notFoundError();
            }

            if (bcrypt.compareSync(req.body.password, userPass.password)) {
                const token = jwt.sign({ userId: userPass.userId }, jwtSecret.secret, tokenExpiry);

                const user = await userDao.getUser(userPass.userId, true);
                user.jwtToken = token;

                res.status(200).send(user);
            } else {
                throw errors.authError();
            }
        })
    );

    app.post(
        "/validate_token",
        [expressJwt(jwtSecret)],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await userDao.getUser(req.user.userId, true));
        })
    );
};
