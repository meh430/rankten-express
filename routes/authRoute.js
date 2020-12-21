const jwt = require("jsonwebtoken");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const userDao = require("../daos/userDao");

module.exports = (app) => {
    app.post(
        "/signup",
        errors.asyncError(async (req, res, next) => {
            console.log(req.body);
            if (await userDao.userExists(req.body.username)) {
                throw errors.badRequest();
            }

            const createdId = await userDao.createUser(req.body);
            const token = jwt.sign({ userId: createdId }, jwtSecret.secret, { expiresIn: 7 * 24 * 60 * 60 });
            
            const createdUser = await userDao.getUser(createdId, true);
            createdUser.jwtToken = token;

            res.status(200).send(createdUser);
        })
    );
};
