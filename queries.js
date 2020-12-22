const mysql = require("mysql");

// Whenever creating a row, make sure to add appropriate foreign keys

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

function getUserWithNameQuery(username) {
    return mysql.format("SELECT Users.userId, Users.password FROM Users WHERE username = ?", [username]);
}

function getUserQuery(userId) {
    return mysql.format(
        "SELECT Users.*, (" +
            countUserListsQuery(userId) +
            ") AS numLists, (" +
            countUserCommentsQuery(userId) +
            ") AS numComments, (" +
            countFollowingQuery(userId) +
            ") AS numFollowing, (" +
            countFollowersQuery(userId) +
            ") AS numFollowers FROM Users WHERE Users.userId = ?",
        [userId]
    );
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
    return mysql.format("UPDATE Comments SET comment = ? WHERE userId = ? AND commentId = ?", [
        comment,
        userId,
        commentId,
    ]);
}

function deleteCommentQuery(commentId, userId) {
    return mysql.format("DELETE FROM Comments WHERE commentId = ? AND userId = ?", [commentId, userId]);
}

const commentAttributes =
    "SELECT Comments.*, Users.username, Users.profilePic, " +
    "(SELECT COUNT(CommentLikes.userId) FROM CommentLikes WHERE" +
    "CommentLikes.commentId = Comments.commentId) AS numLikes ";

function page(page) {
    return " LIMIT " + page[0] + " OFFSET " + page[1];
}

function sortAndPage(page, sort) {
    return " ORDER BY " + sort + page(page);
}

function getCommentListQuery(commentId) {
    return mysql.format("SELECT listId from Comments WHERE commentId = ? LIMIT 1", [commentId]);
}

function getListCommentsQuery(listId, page, sort) {
    return mysql.format(
        commentAttributes +
            "FROM Comments JOIN Users ON Comments.userId = Users.userId " +
            "WHERE Comments.listId = ?" +
            sortAndPage(page, sort),
        [listId]
    );
}

function getUserCommentsQuery(userId, page, sort) {
    return mysql.format(
        commentAttributes +
            "FROM Comments JOIN Users ON Comments.userId = Users.userId " +
            "WHERE Comments.userId = ?" +
            sortAndPage(page, sort),
        [userId]
    );
}

function getRankItemsPreviewQuery(listId) {
    return mysql.format("SELECT * FROM RankItems WHERE listId = ? ORDER BY ranking ASC LIMIT 3", [listId]);
}

const rankedListAttributes =
    "SELECT RankedLists.*, Users.username, Users.profilePic, " +
    "(SELECT COUNT(ListLikes.userId) FROM ListLikes WHERE ListLikes.listId = RankedLists.listId) AS numLikes, " +
    "(SELECT COUNT(Comments.commentId) FROM Comments WHERE Comments.listId = RankedLists.listId) AS numComments ";

function getDiscoverQuery(page, sort) {
    return (
        rankedListAttributes +
        "FROM RankedLists JOIN Users ON RankedLists.userId = Users.userId " +
        "WHERE RankedLists.private = false" +
        sortAndPage(page, sort)
    );
}

function unfollowQuery(userId, targetId) {
    return mysql.format("DELETE FROM Follows WHERE userId = ? AND followsId = ?", [userId, targetId]);
}

function followQuery(userId, targetId) {
    return mysql.format("INSERT INTO Follows SET userId = ?, followsId = ?", [userId, targetId]);
}

function deleteFromFollowersQuery(userId) {
    return mysql.format("DELETE FROM Follows WHERE followsId = ?", [userId]);
}

const userPreviewAttributes = "SELECT Users.userId, Users.username, Users.profilePic, Users.bio, Users.rankPoints ";

function getFollowingQuery(userId) {
    return mysql.format(
        userPreviewAttributes + "FROM Follows JOIN Users ON Follows.followsId = Users.userId WHERE Follows.userId = ?",
        [userId]
    );
}

function getFollowersQuery(userId) {
    return mysql.format(
        userPreviewAttributes + "FROM Follows JOIN Users ON Follows.userId = Users.userId WHERE Follows.followsId = ?",
        [userId]
    );
}

function unlikeListQuery(userId, listId) {
    return mysql.format("DELETE FROM ListLikes WHERE userId = ? AND listId = ?", [userId, listId]);
}

function likeListQuery(userId, listId) {
    return mysql.format("INSERT INTO ListLikes SET userId = ?, listId = ?", [userId, listId]);
}

function getListLikersQuery(listId) {
    return mysql.format(
        userPreviewAttributes +
            "FROM ListLikes JOIN Users ON " +
            "ListLikes.userId = Users.userId WHERE ListLikes.userId = ?",
        [listId]
    );
}

function unlikeCommentQuery(userId, commentId) {
    return mysql.format("DELETE FROM CommentLikes WHERE userId = ? AND commentId = ?", [userId, commentId]);
}

function likeCommentQuery(userId, commentId) {
    return mysql.format("INSERT INTO CommentLikes SET userId = ?, commentId = ?", [userId, commentId]);
}

function getLikedListsQuery(userId, page) {
    return mysql.format(
        rankedListAttributes +
            "FROM ListLikes JOIN RankedLists ON ListLikes.listId = RankedLists.listId " +
            "JOIN Users ON RankedLists.userId = Users.userId WHERE ListLikes.userId = ?" +
            page(page),
        [userId]
    );
}

function getLikedCommentsQuery(userId, page) {
    return mysql.format(
        commentAttributes +
            "FROM CommentLikes JOIN Comments ON CommentLikes.commentId = Comments.commentId " +
            "JOIN Users ON Comments.userId = Users.userId WHERE CommentLikes.userId = ?" +
            page(page),
        [userId]
    );
}

function getRankedListQuery(listId) {
    return mysql.format(
        rankedListAttributes +
            "FROM RankedLists JOIN Users ON RankedLists.userId = Users.userId " +
            "WHERE RankedLists.listId = ?",
        [listId]
    );
}

function getRankItemsQuery(listId) {
    return mysql.format("SELECT * FROM RankItems WHERE listId = ? ORDER BY ranking ASC", [listId]);
}

function getRankItemIds(listId) {
    return mysql.format("SELECT itemId FROM RankItems WHERE listId = ? ORDER BY ranking ASC", [listId]);
}

function updateRankedListQuery(rankedList, listId, userId) {
    return mysql.format("UPDATE RankedLIsts SET ? WHERE listId = ? AND userId = ?", [rankedList, listId, userId]);
}

function updateRankItemQuery(rankItem, itemId, listId) {
    return mysql.format("UPDATE RankItems SET ? WHERE itemId = ?", [rankItem, itemId]);
}

function createRankItemQuery(rankItem) {
    return mysql.format("INSERT INTO RankItems SET ?", [rankItem]);
}

function deleteRankItemQuery(itemId) {
    return mysql.format("DELETE FROM RankItems WHERE itemId = ?", [itemId]);
}

function deleteListRankItemsQuery(listId) {
    return mysql.format("DELETE FROM RankItems WHERE listId = ?", [listId]);
}

function getCommentPreview(listId) {
    return mysql.format(
        "SELECT Comments.comment, Comments.dateCreated, Users.username, " +
            "Users.profilePic, FROM Comments JOIN Users ON " +
            "Comments.userId = Users.userId WHERE Comments.listId = ? LIMIT 1",
        [listId]
    );
}

function deleteRankedListQuery(listId, userId) {
    return mysql.format("DELETE FROM RankedLists WHERE listId = ? AND userId = ?", [listId, userId]);
}

function createRankedListQuery(rankedList) {
    return mysql.format("INSERT INTO RankedLists SET ?", [rankedList]);
}

function getUserRankedListsQuery(userId, page, sort) {
    return mysql.format(
        rankedListAttributes +
            "FROM RankedLists JOIN Users ON RankedLists.userId = Users.userId " +
            "WHERE RankedLists.private = false AND RankedLists.userId = ?" +
            sortAndPage(page, sort),
        [userId]
    );
}

function getAllUserRankedListsQuery(userId, page, sort) {
    return mysql.format(
        rankedListAttributes +
            "FROM RankedLists JOIN Users ON RankedLists.userId = Users.userId " +
            "WHERE RankedLists.userId = ?" +
            sortAndPage(page, sort),
        [userId]
    );
}

function getFeedQuery(userId, lastDay) {
    return mysql.format(
        rankedListAttributes +
            "FROM RankedLists JOIN Users ON RankedLists.userId = Users.userId " +
            "WHERE RankedLists.userId = ? AND RankedLists.dateCreated >= ?",
        [userId, lastDay]
    );
}

function countSearchUsersQuery(query) {
    return mysql.format(
        "SELECT COUNT(Users.userId) FROM Users " +
            "WHERE MATCH(Users.username, Users.bio) AGAINST(? IN NATURAL LANGUAGE MODE)",
        [query]
    );
}

function searchUsersQuery(query, page, sort) {
    if (sort) {
        return (
            userPreviewAttributes +
            mysql.format(
                "FROM Users WHERE MATCH(Users.username, Users.bio) " +
                    "AGAINST(? IN NATURAL LANGUAGE MODE)" +
                    sortAndPage(page, sort),
                [query]
            )
        );
    } else {
        return (
            userPreviewAttributes +
            mysql.format(
                "FROM Users WHERE MATCH(Users.username, Users.bio) " +
                    "AGAINST(? IN NATURAL LANGUAGE MODE)" +
                    page(page),
                [query]
            )
        );
    }
}

function searchRankItemsQuery(query) {
    return mysql.format(
        "SELECT RankItems.listId AS lId FROM RankItems " +
            "WHERE RankItems.private = false AND " +
            "MATCH(RankItems.listTitle, RankItems.itemName, RankItems.description) " +
            "AGAINST(? IN NATURAL LANGUAGE MODE)",
        [query]
    );
}

function countSearchListsQuery(query) {
    return (
        "SELECT COUNT(RankedLists.listId) FROM (" +
        searchRankItemsQuery(query) +
        ") AS search JOIN RankedLists ON search.lId = RankedLists.listId"
    );
}

function searchListsQuery(query, page, sort) {
    if (sort) {
        return (
            rankedListAttributes +
            "FROM (" +
            searchRankItemsQuery(query) +
            ") AS search JOIN RankedLists ON search.lId = RankedLists.listId" +
            sortAndPage(page, sort)
        );
    } else {
        return (
            rankedListAttributes +
            "FROM (" +
            searchRankItemsQuery(query) +
            ") AS search JOIN RankedLists ON search.lId = RankedLists.listId" +
            page(page)
        );
    }
}

module.exports = {
    createUserQuery,
    deleteUserQuery,
    updateUserQuery,
    countUserListsQuery,
    countUserCommentsQuery,
    countFollowersQuery,
    countFollowingQuery,
    getUserWithNameQuery,
    getUserQuery,
    getFollowingIdsQuery,
    getFollowerIdsQuery,
    getLikedListIdsQuery,
    getLikedCommentIdsQuery,
    createCommentQuery,
    updateCommentQuery,
    deleteCommentQuery,
    getListCommentsQuery,
    getUserCommentsQuery,
    getRankItemsPreviewQuery,
    getDiscoverQuery,
    unfollowQuery,
    followQuery,
    deleteFromFollowersQuery,
    getFollowingQuery,
    getFollowersQuery,
    unlikeListQuery,
    likeListQuery,
    getListLikersQuery,
    unlikeCommentQuery,
    likeCommentQuery,
    getLikedListsQuery,
    getLikedCommentsQuery,
    getRankedListQuery,
    getRankItemsQuery,
    getRankItemIds,
    updateRankedListQuery,
    updateRankItemQuery,
    createRankItemQuery,
    deleteRankItemQuery,
    deleteListRankItemsQuery,
    getCommentPreview,
    deleteRankedListQuery,
    createRankedListQuery,
    getUserRankedListsQuery,
    getAllUserRankedListsQuery,
    getFeedQuery,
    countSearchUsersQuery,
    searchUsersQuery,
    searchRankItemsQuery,
    countSearchListsQuery,
    searchListsQuery,
    page,
    getCommentListQuery
};
