const queries = require("../queries");
const sql = require("../sqlPromise");
const utils = require("../utils");

async function createComment(comment, userId, listId) {
    delete comment.commentId;

    comment.userId = userId;
    comment.listId = listId;
    comment.dateCreated = Date.now();

    const res = await sql.poolQuery(queries.createCommentQuery(comment));
    console.log(res);

    return res.insertId;
}

async function updateComment(commentId, userId, comment) {
    const res = await sql.poolQuery(queries.updateCommentQuery(commentId, userId, comment));
    console.log(res);

    utils.checkRow(res);
}

async function deleteComment(commentId, userId) {
    const res = await sql.poolQuery(queries.deleteCommentQuery(commentId, userId));
    console.log(res);

    utils.checkRow();
}

async function getListComments(listId, page, sort) {
    const comments = await sql.poolQuery(
        queries.getListCommentsQuery(listId, utils.limitAndOffset(page), utils.getSort(sort))
    );
    console.log(comments);

    return utils.validatePage(comments);
}

async function getUserComments(userId, page, sort) {
    const comments = await sql.poolQuery(
        queries.getUserCommentsQuery(userId, utils.limitAndOffset(page), utils.getSort(sort))
    );
    console.log(comments);

    return utils.validatePage(comments);
}

async function getLikedComments(userId, page) {
    return utils.validatePage(await sql.poolQuery(queries.getLikedCommentsQuery(userId, utils.limitAndOffset(page))));
}

async function getCommentList(commentId) {
    const comment = await sql.poolQuery(queries.getCommentListQuery(commentId));
    utils.checkIfFound(comment);

    return comment[0].listId;
}

module.exports = { createComment, updateComment, deleteComment, getListComments, getUserComments, getLikedComments, getCommentList };
