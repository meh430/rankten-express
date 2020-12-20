const mysql = require('mysql');

function createUserQuery(user) {
    return mysql.format("INSERT INTO Users SET ?", [user]);
}

function deleteUserQuery(userId) {
    return mysql.format("DELETE FROM Users WHERE userId = ?", [userId]);
}

function updateUserQuery(userId, user) {
    return mysql.format("UPDATE Users SET ? WHERE userId = ?", [user, userId]);
} 

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

function getFollowingIdsQuery(userId) {
    return mysql.format("SELECT followsId FROM Follows WHERE userId = ?", [userId]);
}

function getFollowerIdsQuery(userId) {
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

function updateCommentQuery(commentId, userId, comment) {
    return mysql.format("UPDATE Comments SET comment = ? WHERE userId = ? AND commentId = ?",
        [comment, userId, commentId]);
}

function deleteCommentQuery(commentId, userId) {
    return mysql.format("DELETE FROM Comments WHERE commentId = ? AND userId = ?", [commentId, userId]);
}

const commentAttributes = "SELECT Comments.*, Users.username, Users.profilePic, " +
    "(SELECT COUNT(CommentLikes.userId) FROM CommentLikes WHERE" +
    "CommentLikes.commentId = Comments.commentId) AS numLikes ";

function page(page) {
    return " LIMIT " + page[0] + " OFFSET " + page[1];
}

function sortAndPage(sort, page) {
    return " ORDER BY " + sort + page(page);
}

function getListCommentsQuery(listId, sort, page) {
    return mysql.format(commentAttributes +
        "FROM Comments JOIN Users ON Comments.userId = Users.userId " +
        "WHERE Comments.listId = ?" + sortAndPage(sort, page), [listId]);
}

function getUserCommentsQuery(userId, sort, page) {
    return mysql.format(commentAttributes +
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

function getFollowersQuery(userId) {
    return mysql.format(userPreviewAttributes +
        "FROM Follows JOIN Users ON Follows.userId = Users.userId WHERE Follows.followsId = ?", [userId]);
}

function unlikeListQuery(userId, listId) {
    return mysql.format("DELETE FROM ListLikes WHERE userId = ? AND listId = ?", [userId, listId]);
}

function likeListQuery(userId, listId) {
    return mysql.format("INSERT INTO ListLikes SET userId = ?, listId = ?", [userId, listId]);
}

function unlikeCommentQuery(userId, commentId) {
    return mysql.format("DELETE FROM CommentLikes WHERE userId = ? AND commentId = ?", [userId, commentId]);
}

function likeCommentQuery(userId, commentId) {
    return mysql.format("INSERT INTO CommentLikes SET userId = ?, commentId = ?", [userId, commentId]);
}

function getLikedListsQuery(userId, page) {
    return mysql.format(rankedListAttributes +
        "FROM ListLikes JOIN RankedLists ON ListLikes.listId = RankedLists.listId " +
        "JOIN Users ON RankedLists.userId = Users.userId WHERE ListLikes.userId = ?" +
        page(page), [userId]);
}

function getLikedCommentsQuery(userId, page) {
    return mysql.format(commentAttributes +
        "FROM CommentLikes JOIN Comments ON CommentLikes.commentId = Comments.commentId " +
        "JOIN Users ON Comments.userId = Users.userId WHERE CommentLikes.userId = ?" +
        page(page), [userId]);
}

function getRankedListQuery(listId) {
    return mysql.format(rankedListAttributes +
        "FROM RankedLists JOIN Users ON RankedLists.userId = Users.userId " +
        "WHERE RankedLists.listId = ?", [listId]);
}

function getRankItemsQuery(listId) {
    return mysql.format("SELECT * FROM RankItems WHERE listId = ? ORDER BY rank ASC", [listId]);
}

function getRankItemIds(listId) {
    return mysql.format("SELECT itemId FROM RankItems WHERE listId = ? ORDER BY rank ASC", [listId]);
}

function updateRankedListQuery(rankedList, listId) {
    return mysql.format("UPDATE RankedLIsts SET ? WHERE listId = ?", [rankedList, listId]);
}

function updateRankItemQuery(rankItem, itemId, listId) {
    return mysql.format("UPDATE RankItems SET ? WHERE itemId = ? AND listId = ?", [rankItem, itemId, listId]);
}

function createRankItemQuery(rankItem) {
    return mysql.format("INSERT INTO RankItems SET ?", [rankItem])
}

function deleteRankItemQuery(itemId, listId) {
    return mysql.format("DELETE FROM RankItems WHERE itemId = ? AND listId = ?", [itemId, listId]);
}

function deleteRankedListQuery(listId, userId) {
    return mysql.format("DELETE FROM RankedLists WHERE listId = ? AND userId = ?", [listId, userId]);
}

function createRankedListQuery(rankedList) {
    return mysql.format("INSERT INTO RankedLists SET ?", [rankedList]);
}

function getUserRankedListsQuery(userId, sort, page) {
    return mysql.format(rankedListAttributes +
        "FROM RankedLists JOIN Users ON RankedLists.userId = Users.userId " +
        "WHERE RankedLists.private = false AND RankedLists.userId = ?" +
        sortAndPage(sort, page), [userId]);
}

function getAllUserRankedListsQuery(userId, sort, page) {
    return mysql.format(rankedListAttributes +
        "FROM RankedLists JOIN Users ON RankedLists.userId = Users.userId " +
        "WHERE RankedLists.userId = ?" + sortAndPage(sort, page), [userId]);
}

function getFeedQuery(userId, lastDay) {
    return mysql.format(rankedListAttributes +
        "FROM RankedLists JOIN Users ON RankedLists.userId = Users.userId " +
        "WHERE RankedLists.userId = ? AND RankedLists.dateCreated >= ?", [userId, lastDay]);
}

function countSearchUsersQuery(query) {
    return mysql.format("SELECT COUNT(Users.userId) FROM Users " +
        "WHERE MATCH(Users.username, Users.bio) AGAINST(? IN NATURAL LANGUAGE MODE)", [query]);
}

function searchUsersQuery(query, sort, page) {
    if (sort) {
        return userPreviewAttributes +
            mysql.format("FROM Users WHERE MATCH(Users.username, Users.bio) " +
                "AGAINST(? IN NATURAL LANGUAGE MODE)" + sortAndPage(sort, page), [query]);
    } else {
        return userPreviewAttributes +
            mysql.format("FROM Users WHERE MATCH(Users.username, Users.bio) " +
                "AGAINST(? IN NATURAL LANGUAGE MODE)" + page(page), [query]);
    }
}

function searchRankItemsQuery(query) {
    return mysql.format("SELECT RankItems.listId AS lId FROM RankItems " +
        "WHERE RankItems.private = false AND " +
        "MATCH(RankItems.listTitle, RankItems.itemName, RankItems.description) " +
        "AGAINST(? IN NATURAL LANGUAGE MODE)", [query]);
}

function countSearchListsQuery(query) {
    return ("SELECT COUNT(RankedLists.listId) FROM (" + searchRankItemsQuery(query) +
        ") AS search JOIN RankedLists ON search.lId = RankedLists.listId");
}

function searchListsQuery(query, sort, page) {
    if (sort) {
        return rankedListAttributes + "FROM (" + searchRankItemsQuery(query) +
            ") AS search JOIN RankedLists ON search.lId = RankedLists.listId" + sortAndPage(sort, page); 
    } else {
        return rankedListAttributes + "FROM (" + searchRankItemsQuery(query) +
            ") AS search JOIN RankedLists ON search.lId = RankedLists.listId" + page(page);
    }
}