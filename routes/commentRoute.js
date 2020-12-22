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
        "/comment/:commentId",
        [parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            const listId = await commentDao.getCommentList(req.params.commentId);

            res.status(200).send(await rankedlistDao.getRankedList(listId));
        })
    );

    app.post(
        "/comment/:listId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            await commentDao.createComment(req.body.comment, req.user.userId, req.params.listId);
            res.status(200).send("Created comment");
        })
    );

    app.put(
        "/comment/:commentId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            await commentDao.updateComment(req.params.commentId, req.user.userId, req.body.comment);
            res.status(200).send("Updated comment");
        })
    );

    app.delete(
        "/comment/:commentId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            await commentDao.deleteComment(req.params.commentId, req.user.userId);
            res.status(200).send("Deleted comment");
        })
    );

    app.get(
        "/comments/:listId/:page/:sort",
        [parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await commentDao.getListComments(req.params.listId, req.params.page, req.params.sort));
        })
    );

    app.get(
        "/user_comments/:page/:sort",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(await commentDao.getUserComments(req.user.userId, req.params.page, req.params.sort));
        })
    );
};
