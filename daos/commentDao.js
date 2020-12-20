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

module.exports = { createComment };