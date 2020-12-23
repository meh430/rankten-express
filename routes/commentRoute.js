const expressJwt = require("express-jwt");
const jwtSecret = require("../config").jwtSecret;
const errors = require("../middleware/errorHandler");
const parameters = require("../middleware/parameters");
const rankedlistDao = require("../daos/rankedListDao");
const commentDao = require("../daos/commentDao");
const cacher = require("../middleware/cacher");
const utils = require("../utils");

module.exports = (app) => {
    // Returns the list a specified comment belongs to
    app.get(
        "/comment/:commentId",
        [parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            const listId = await commentDao.getCommentList(req.params.commentId);

            res.status(200).send(await rankedlistDao.getRankedList(listId));
        })
    );

    /* Creates new comment
    body schema: {comment: string}
    */
    app.post(
        "/comment/:listId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            await commentDao.createComment(req.body, req.user.userId, req.params.listId);
            res.status(200).send({ message: "Created comment" });
        })
    );

    /* Updates comment
    body schema: {comment: string}
    */
    app.put(
        "/comment/:commentId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            await commentDao.updateComment(req.params.commentId, req.user.userId, req.body.comment);
            res.status(200).send({ message: "Updated comment" });
        })
    );

    // Deletes comment
    app.delete(
        "/comment/:commentId",
        [expressJwt(jwtSecret), parameters.parseParameters],
        errors.asyncError(async (req, res, next) => {
            await commentDao.deleteComment(req.params.commentId, req.user.userId);
            res.status(200).send({ message: "Deleted comment" });
        })
    );

    // Returns all comments on a list
    app.get(
        "/comments/:listId/:page/:sort",
        [parameters.parseParameters, cacher(3, utils.hoursToSec(2))],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(
                utils.getPagingInfo(
                    ...(await commentDao.getListComments(req.params.listId, req.params.page, req.params.sort)),
                    req.params.page
                )
            );
        })
    );

    // Returns all comments made by user
    app.get(
        "/user_comments/:page/:sort",
        [expressJwt(jwtSecret), parameters.parseParameters, cacher(2, utils.hoursToSec(2), true)],
        errors.asyncError(async (req, res, next) => {
            res.status(200).send(
                utils.getPagingInfo(
                    ...(await commentDao.getUserComments(req.user.userId, req.params.page, req.params.sort)),
                    req.params.page
                )
            );
        })
    );
};
