const expressJwt = require("express-jwt");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const parameters = require("../middleware/parameters");
const rankedlistDao = require("../daos/rankedListDao");
const redisCache = require("../redisCache");
const cacher = require("../middleware/cacher");
const utils = require("../utils");
const sql = require("../sqlPromise");

module.exports = (app) => {
    app.get(
        "/discover/:page/:sort",
        [parameters.parseParameters, cacher(2, utils.hoursToSec(2))],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(
                utils.getPagingInfo(
                    ...(await rankedlistDao.getDiscoverLists(req.params.page, req.params.sort)),
                    req.params.page
                )
            );
        })
    );

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
            res.status(200).send({ message: "Created ranked list" });
        })
    );

    // Updates a list, see POST for schema. NOTE: rankItem object may contain "itemId"
    app.put(
        "/rankedlist/:listId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            await rankedlistDao.updateRankedList(req.params.listId, req.user.userId, req.body);
            res.status(200).send({ message: "Updated ranked list" });
        })
    );

    // Deletes a list
    app.delete(
        "/rankedlist/:listId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            await rankedlistDao.deleteRankedList(req.params.listId, req.user.userId);
            res.status(200).send({ message: "Deleted ranked list" });
        })
    );

    // Returns lists created by a user
    app.get(
        "/rankedlists/:userId/:page/:sort",
        [parameters.parseParameters, cacher(3, utils.hoursToSec(1))],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(
                utils.getPagingInfo(
                    ...(await rankedlistDao.getUserLists(req.params.userId, req.params.page, req.params.sort, false)),
                    req.params.page
                )
            );
        })
    );

    // Returns lists created by user, including private
    app.get(
        "/rankedlistsp/:page/:sort",
        [expressJwt(jwtSecret), parameters.parseParameters, cacher(2, utils.hoursToSec(2), true)],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(
                utils.getPagingInfo(
                    ...(await rankedlistDao.getUserLists(req.user.userId, req.params.page, req.params.sort, true)),
                    req.params.page
                )
            );
        })
    );

    // Returns user feed
    app.get(
        "/feed/:page",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            const keyName = "feed:" + req.user.userId;
            const cachedFeed = await redisCache.get(keyName);

            if (!req.query.re && cachedFeed) {
                const parsedCache = JSON.parse(cachedFeed);
                res.status(200).send(
                    utils.getPagingInfo(
                        parsedCache.slice(req.params.page * 10, req.params.page * 10 + 10),
                        parsedCache.length,
                        req.params.page
                    )
                );
            } else {
                const feed = await rankedlistDao.getFeed(req.user.userId);
                await redisCache.set(keyName, JSON.stringify(feed), utils.hoursToSec(4));
                res.status(200).send(
                    utils.getPagingInfo(
                        feed.slice(req.params.page * 10, req.params.page * 10 + 10),
                        feed.length,
                        req.params.page
                    )
                );
            }
        })
    );
};
