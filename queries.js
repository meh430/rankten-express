const mysql = require('mysql');

function countUserListsQuery(userId) {
    return mysql.format("SELECT COUNT(RankedLists.listId) FROM RankedLists WHERE RankedLists.userId = ?", [userId]);
}

function countUserCommentsQuery(userId) {
    return mysql.format("SELECT COUNT(Comments.commentId) FROM Comments WHERE Comments.userId = ?", [userId]);
}

function countFollowersQuery(userId) {
    return mysql.format("SELECT COUNT(Follows.userId) FROM Follows WHERE Follows.followId = ?", [userId]);
}

function countFollowingQuery(userId) {
    return mysql.format("SELECT COUNT(Follows.followId) FROM Follows WHERE Follows.userId = ?", [userId]);
}

function getUserQuery(userId) {
    return mysql.format("SELECT Users.*, (" + countUserListsQuery(userId) +
        ") AS numLists, (" + countUserCommentsQuery(userId) + ") AS numComments, (" + 
        countFollowingQuery(userId) + ") AS numFollowing, (" + 
        countFollowersQuery(userId) + ") AS numFollowers FROM Users WHERE Users.userId = ?", [userId]);
}

function getFollowingQuery(userId) {
    return mysql.format("SELECT followsId FROM Follows WHERE userId = ?", [userId]);
}

function getFollowersQuery(userId) {
    return mysql.format("SELECT userId FROM Follows WHERE followId = ?", [userId]);
}

function getLikedListIdsQuery(userId) {
    return mysql.format("SELECT listId FROM ListLikes WHERE userId = ?", [userId]);
}

function getLikedCommentIdsQuery(userId) {
    return mysql.format("SELECT commentId FROM CommentLikes WHERE userId = ?", [userId]);
}

function createCommentQuery(comment) {
    return mysql.format("INSERT INTO Comments SET ?", [comment]);
}

function updateCommentQuery(commentId, comment) {
    return mysql.format("UPDATE Comments SET comment = ? WHERE commentId = ?",
        [comment, commentId]);
}

function deleteCommentQuery(commentId) {
    return mysql.format("DELETE FROM Comments WHERE commentId = ?", [commentId]);
}

const selectCommentAttributes = "SELECT Comments.*, Users.username, Users.profilePic, " +
    "(SELECT COUNT(CommentLikes.userId) FROM CommentLikes WHERE" +
    "CommentLikes.commentId = Comments.commentId) AS numLikes ";

function sortAndPage(sort, page) {
    return " ORDER BY " + sort + " LIMIT " + page[0] + " OFFSET " + page[1];
}

function getListCommentsQuery(listId, sort, page) {
    return mysql.format(selectCommentAttributes +
        "FROM Comments JOIN Users ON Comments.userId = Users.userId " +
        "WHERE Comments.listId = ?" + sortAndPage(sort, page), [listId]);
}

function getUserCommentsQuery(userId, sort, page) {
    return mysql.format(selectCommentAttributes +
        "FROM Comments JOIN Users ON Comments.userId = Users.userId " +
        "WHERE Comments.userId = ?" + sortAndPage(sort, page), [userId]);
}

