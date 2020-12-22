const expressJwt = require("express-jwt");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const parameters = require("../middleware/parameters");
const rankedlistDao = require("../daos/rankedListDao");
const commentDao = require("../daos/commentDao");
const userDao = require("../daos/userDao");
const queries = require("../queries");

module.exports = (app) => {
    // Likes or unlikes list
    app.post(
        "/like/:listId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            const result = await userDao.likeUnlike(
                req.user.userId,
                req.params.listId,
                queries.getLikedListIdsQuery,
                queries.likeListQuery,
                queries.unlikeListQuery,
                "listId"
            );

            res.status(200).send(result + " list");
        })
    );

    // Returns all users that liked a list
    app.get(
        "/like/:listId",
        [parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await userDao.getListLikers(req.params.listId));
        })
    );

    // Likes or unlikes a comment
    app.post(
        "/like_comment/:commentId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            const result = await userDao.likeUnlike(
                req.user.userId,
                req.params.commentId,
                queries.getLikedCommentIdsQuery,
                queries.likeCommentQuery,
                queries.unlikeCommentQuery,
                "commentId"
            );

            res.status(200).send(result + " comment");
        })
    );

    // Returns all comments liked by user
    app.get(
        "/liked_comments/:page",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await commentDao.getLikedComments(req.user.userId, req.params.page));
        })
    );

    // Returns all lists liked by user
    app.get(
        "/likes/:page",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await rankedlistDao.getLikedLists(req.user.userId, req.params.page));
        })
    );
};
