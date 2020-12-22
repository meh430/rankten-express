const expressJwt = require("express-jwt");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const parameters = require("../middleware/parameters");
const rankedlistDao = require("../daos/rankedListDao");

module.exports = (app) => {
    app.get(
        "/rankedlist/:listId",
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await rankedlistDao.getRankedList(req.params.listId));
        })
    );

    app.put(
        "/rankedlist/:listId",
        [expressJwt(jwtSecret)],
        errors.asyncError(async (req, res, next) => {
            await rankedlistDao.updateRankedList(req.params.listId, req.user.userId, req.body);
            res.status(200).send("Updated ranked list");
        })
    );

    app.delete(
        "/rankedlist/:listId",
        [expressJwt(jwtSecret)],
        errors.asyncError(async (req, res, next) => {
            await rankedlistDao.deleteRankedList(req.params.listId, req.user.userId);
            res.status(200).send("Deleted ranked list");
        })
    );

    app.post(
        "/rankedlist",
        [expressJwt(jwtSecret)],
        errors.asyncError(async (req, res, next) => {
            await rankedlistDao.createRankedList(req.user.userId, req.body);
            res.status(200).send("Created ranked list");
        })
    );

    app.get(
        "/rankedlists/:userId/:page/:sort",
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(
                await rankedlistDao.getUserLists(req.params.userId, req.params.page, req.params.sort, false)
            );
        })
    );

    app.get(
        "/rankedlistsp/:page/:sort",
        [expressJwt(jwtSecret)],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(
                await rankedlistDao.getUserLists(req.user.userId, req.params.page, req.params.sort, true)
            );
        })
    );

    app.get(
        "/feed/:page",
        [expressJwt(jwtSecret)],
        errors.asyncError(async (req, res, next) => {
            const feed = await rankedlistDao.getFeed(req.user.userId);
            res.status(200).send(feed.slice(req.params.page * 10, req.params.page * 10 + 10));
        })
    );
};
