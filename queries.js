const mysql = require('mysql');

function countUserListsQuery(userId) {
    return mysql.format("SELECT COUNT(RankedLists.listId) FROM RankedLists WHERE RankedLists.userId = ?", [userId]);
}

function countUserCommentsQuery(userId) {
    return mysql.format("SELECT COUNT(Comments.commentId) FROM Comments WHERE Comments.userId = ?", [userId]);
}

function countFollowersQuery(userId) {
    return mysql.format("SELECT COUNT(Follows.userId) FROM Follows WHERE Follows.followsId = ?", [userId]);
}

function countFollowingQuery(userId) {
    return mysql.format("SELECT COUNT(Follows.followsId) FROM Follows WHERE Follows.userId = ?", [userId]);
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
    return mysql.format("SELECT userId FROM Follows WHERE followsId = ?", [userId]);
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

function getRankItemsPreviewQuery(listId) {
    return mysql.format("SELECT * FROM RankItems WHERE listId = ? ORDER BY rank ASC LIMIT 3", [listId]);
}

const rankedListAttributes = "SELECT RankedLists.*, Users.username, Users.profilePic, " +
    "(SELECT COUNT(ListLikes.userId) FROM ListLikes WHERE ListLikes.listId = RankedLists.listId) AS numLikes, " +
    "(SELECT COUNT(Comments.commentId) FROM Comments WHERE Comments.listId = RankedLists.listId) AS numComments ";

function getDiscoverQuery(sort, page) {
    return rankedListAttributes +
        "FROM RankedLists JOIN Users ON RankedLists.userId = Users.userId " +
        "WHERE RankedLists.private = false" + sortAndPage(sort, page);
}

function unfollowQuery(userId, targetId) {
    return mysql.format("DELETE FROM Follows WHERE userId = ? AND followsId = ?",
        [userId, targetId]);
}

function followQuery(userId, targetId) {
    return mysql.format("INSERT INTO Follows SET userId = ?, followsId = ?", [userId, targetId]);
}

const userPreviewAttributes =
    "SELECT Users.userId, Users.username, Users.profilePic, Users.bio, Users.rankPoints ";

function getFollowingQuery(userId) {
    return mysql.format(userPreviewAttributes +
        "FROM Follows JOIN Users ON Follows.followsId = Users.userId WHERE Follows.userId = ?", [userId]);
}

function getFollowingQuery(userId) {
    return mysql.format(userPreviewAttributes +
        "FROM Follows JOIN Users ON Follows.userId = Users.userId WHERE Follows.followsId = ?", [userId]);
}

