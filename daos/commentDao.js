const queries = require("../queries");
const sql = require("../sqlPromise");
const utils = require("../utils");

async function createComment(comment, userId, listId) {
    delete comment.commentId;

    comment.userId = userId;
    comment.listId = listId;
    comment.dateCreated = Date.now();

    const res = await sql.poolQuery(queries.createCommentQuery(comment));

    return res.insertId;
}

async function updateComment(commentId, userId, comment) {
    const res = await sql.poolQuery(queries.updateCommentQuery(commentId, userId, comment));

    utils.checkRow(res);
}

async function deleteComment(commentId, userId) {
    const res = await sql.poolQuery(queries.deleteCommentQuery(commentId, userId));

    utils.checkRow(res);
}

async function getListComments(listId, page, sort) {
    const [comments, itemCount] = await Promise.all([
        sql.poolQuery(queries.getListCommentsQuery(listId, utils.limitAndOffset(page), utils.getSort(sort))),
        sql.poolQuery(queries.countListCommentsQuery(listId)),
    ]);

    return [comments, itemCount[0].itemCount];
}

async function getUserComments(userId, page, sort) {
    const [comments, itemCount] = await Promise.all([
        sql.poolQuery(queries.getUserCommentsQuery(userId, utils.limitAndOffset(page), utils.getSort(sort))),
        sql.poolQuery(queries.countUserCommentsQuery(userId)),
    ]);

    return [comments, itemCount[0].itemCount];
}

async function getLikedComments(userId, page) {
    const [comments, itemCount] = await Promise.all([
        sql.poolQuery(queries.getLikedCommentsQuery(userId, utils.limitAndOffset(page))),
        sql.poolQuery(queries.countLikedCommentsQuery(userId)),
    ]);
    
    return [comments, itemCount[0].itemCount];
}

async function getCommentList(commentId) {
    const comment = await sql.poolQuery(queries.getCommentListQuery(commentId));
    utils.checkIfFound(comment);

    return comment[0].listId;
}

module.exports = {
    createComment,
    updateComment,
    deleteComment,
    getListComments,
    getUserComments,
    getLikedComments,
    getCommentList,
};
