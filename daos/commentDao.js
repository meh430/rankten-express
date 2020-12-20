const queries = require("../queries");
const sql = require("../models/sqlPromise");
const errors = require("../middleware/errorHandler");
const utils = require("../utils");

async function createComment(connection, comment, userId, listId) {
    delete comment.commentId;

    comment.userId = userId;
    comment.listId = listId;
    comment.dateCreated = Date.now();

    const res = await sql.query(connection, queries.createCommentQuery(comment));
    console.log(res);

    return res.insertId;
}

async function updateComment(connection, commentId, userId, comment) {
    const res = await sql.query(connection, queries.updateCommentQuery(commentId, userId, comment));
    console.log(res);

    utils.checkRow(res);
}

async function deleteComment(connection, commentId, userId) {
    const res = await sql.query(connection, queries.deleteCommentQuery(commentId, userId));
    console.log(res);

    utils.checkRow();
}

module.exports = { createComment, updateComment, deleteComment };