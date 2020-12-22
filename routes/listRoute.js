const expressJwt = require("express-jwt");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const parameters = require("../middleware/parameters");
const rankedlistDao = require("../daos/rankedListDao");

module.exports = (app) => {
    // Returns a list
    app.get(
        "/rankedlist/:listId",
        [parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await rankedlistDao.getRankedList(req.params.listId));
        })
    );

    /* Creates a list
    body schema: {
        title: string,
        private: bool,
        rankItems: [
            {
                ranking: int,
                itemName: string,
                description: string,
                picture: string
            }
        ]
    }
    */
    app.post(
        "/rankedlist",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            await rankedlistDao.createRankedList(req.user.userId, req.body);
            res.status(200).send("Created ranked list");
        })
    );

    // Updates a list, see POST for schema. NOTE: rankItem object may contain "itemId"
    app.put(
        "/rankedlist/:listId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            await rankedlistDao.updateRankedList(req.params.listId, req.user.userId, req.body);
            res.status(200).send("Updated ranked list");
        })
    );

    // Deletes a list
    app.delete(
        "/rankedlist/:listId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            await rankedlistDao.deleteRankedList(req.params.listId, req.user.userId);
            res.status(200).send("Deleted ranked list");
        })
    );

    // Returns lists created by a user
    app.get(
        "/rankedlists/:userId/:page/:sort",
        [parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(
                await rankedlistDao.getUserLists(req.params.userId, req.params.page, req.params.sort, false)
            );
        })
    );

    // Returns lists created by user, including private
    app.get(
        "/rankedlistsp/:page/:sort",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(
                await rankedlistDao.getUserLists(req.user.userId, req.params.page, req.params.sort, true)
            );
        })
    );

    // Returns user feed
    app.get(
        "/feed/:page",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            const feed = await rankedlistDao.getFeed(req.user.userId);
            res.status(200).send(feed.slice(req.params.page * 10, req.params.page * 10 + 10));
        })
    );
};
