const expressJwt = require("express-jwt");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const parameters = require("../middleware/parameters");
const rankedlistDao = require("../daos/rankedListDao");
const commentDao = require("../daos/commentDao");
const userDao = require("../daos/userDao");
const queries = require("../queries");

module.exports = (app) => {
    app.get(
        "/search_users/:page/:sort",
        [parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            const query = getQuery(req);
            res.status(200).send(await userDao.searchUsers(query, req.params.page, req.params.sort));
        })
    );

    app.get(
        "/search_lists/:page/:sort",
        [parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            const query = getQuery(req);
            res.status(200).send(await rankedlistDao.searchLists(query, req.params.page, req.params.sort));
        })
    );
};

function getQuery(req) {
    const query = req.query.q;
    if (!query || query.length < 3) {
        throw errors.badRequest();
    }

    return query;
}
