const queries = require("../queries");
const sql = require("../sqlPromise");
const utils = require("../utils");

async function createComment(comment, userId, listId) {
    //delete comment.commentId;
    //comment.userId = userId;
    //comment.listId = listId;
    //comment.dateCreated = Date.now();

    const res = await sql.poolQuery(
        queries.createCommentQuery({
            comment: comment.comment,
            userId: userId,
            listId: listId,
            dateCreated: Date.now(),
        })
    );
    const createdComment = await sql.poolQuery(queries.getComment(res.insertId));
    utils.checkIfFound(createdComment);
    console.log(createdComment[0])
    return createdComment[0];
}

async function updateComment(commentId, userId, comment) {
    const res = await sql.poolQuery(queries.updateCommentQuery(commentId, userId, comment));
    utils.checkRow(res);
    const updatedComment = await sql.poolQuery(queries.getComment(commentId));
    utils.checkIfFound(updatedComment);
        console.log(updateComment[0])

    return updatedComment[0];
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

async function getLikedComments(userId, page, sort) {
    const [comments, itemCount] = await Promise.all([
        sql.poolQuery(queries.getLikedCommentsQuery(userId, utils.limitAndOffset(page), utils.getSort(sort))),
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
