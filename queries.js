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