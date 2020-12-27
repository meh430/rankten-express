const errors = require("../middleware/errorHandler");
const parameters = require("../middleware/parameters");
const rankedlistDao = require("../daos/rankedListDao");
const userDao = require("../daos/userDao");
const cacher = require("../middleware/cacher");
const utils = require("../utils");

module.exports = (app) => {
    app.get(
        "/search_users/:page/:sort",
        [parameters.parseParameters, cacher(2, utils.hoursToSec(12))],
        errors.asyncError(async (req, res, next) => {
            const query = getQuery(req);
            if (!query) {
                return res.status(200).send(utils.getPagingInfo([], 0, 0, 100));
            }

            res.status(200).send(
                utils.getPagingInfo(
                    ...(await userDao.searchUsers(query, req.params.page, req.params.sort)),
                    req.params.page,
                    100
                )
            );
        })
    );

    app.get(
        "/search_lists/:page/:sort",
        [parameters.parseParameters, cacher(2, utils.hoursToSec(12))],
        errors.asyncError(async (req, res, next) => {
            const query = getQuery(req);
            if (!query) {
                return res.status(200).send(utils.getPagingInfo([], 0, 0, 10));
            }
            res.status(200).send(
                utils.getPagingInfo(
                    ...(await rankedlistDao.searchLists(query, req.params.page, req.params.sort)),
                    req.params.page
                )
            );
        })
    );
};

function getQuery(req) {
    const query = req.query.q;
    if (!query || query.length < 3) {
        return "";
    }

    return query.replace(/\+/g, " ");
}
