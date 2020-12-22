const bcrypt = require("bcryptjs");
const queries = require("../queries");
const sql = require("../sqlPromise");
const errors = require("../middleware/errorHandler");
const utils = require("../utils");

const namePattern = /^[a-z0-9_-]{3,15}$/g;
const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/g;

// TODO: do not found checks in getters

async function createUser(user) {
    delete user.userId;
    delete user.rankPoints;

    user.dateCreated = Date.now();

    if (!user.username.match(namePattern) || !user.password.match(passwordPattern)) {
        throw errors.invalidCredentialsError();
    }

    user.password = bcrypt.hashSync(user.password);

    const res = await sql.poolQuery(queries.createUserQuery(user));
    return res.insertId;
}

async function updateUser(userId, user) {
    delete user.userId;
    delete user.dateCreated;
    delete user.rankPoints;
    delete user.username;

    if ("password" in user) {
        if (!user.password.match(passwordPattern)) {
            throw errors.invalidCredentialsError();
        }

        user.password = bcrypt.hashSync(user.password);
    }

    const res = await sql.poolQuery(queries.updateUserQuery(userId, user));

    utils.checkRow(res);
}

async function deleteUser(userId) {
    sql.performTransaction(async (connection) => {
        const res = await sql.query(connection, queries.deleteUserQuery(userId));

        utils.checkRow(res);

        await sql.query(connection, queries.deleteFromFollowersQuery(userId));
    });
}

async function getUser(userId, private) {
    let userInfo = await sql.poolQuery(queries.getUserQuery(userId));

    utils.checkIfFound(userInfo);
    userInfo = userInfo[0];

    if (private) {
        const [following, likedLists, likedComments] = await Promise.all([
            sql.poolQuery(queries.getFollowingIdsQuery(userId)),
            sql.poolQuery(queries.getLikedListIdsQuery(userId)),
            sql.poolQuery(queries.getLikedCommentIdsQuery(userId)),
        ]);

        return {
            ...userInfo,
            following: utils.getOnePropArray(following, "followsId"),
            likedLists: utils.getOnePropArray(likedLists, "listId"),
            likedComments: utils.getOnePropArray(likedComments, "commentId"),
        };
    }

    return userInfo;
}

async function getUserWithName(username) {
    const user = await sql.poolQuery(queries.getUserWithNameQuery(username));

    if (user.length) {
        return user[0];
    }

    return false;
}

async function follow(userId, targetId) {
    if (userId === targetId) {
        throw errors.badRequest();
    }

    const following = utils.getOnePropArray(await sql.poolQuery(queries.getFollowingIdsQuery(userId)), "followsId");

    if (following.includes(targetId)) {
        const unfollowed = await sql.poolQuery(queries.unfollowQuery(userId, targetId));

        utils.checkRow(unfollowed);

        return "unfollowed user";
    } else {
        const followed = await sql.poolQuery(queries.followQuery(userId, targetId));

        utils.checkRow(followed);

        return "followed user";
    }
}

async function getFollowing(userId) {
    const following = await sql.poolQuery(queries.getFollowingQuery(userId));

    return following;
}

async function getFollowers(userId) {
    const followers = await sql.poolQuery(queries.getFollowersQuery(userId));

    return followers;
}

// targetId: thing being liked/unliked
// idsQuery: query function that takes userId and returns list of liked ids
// getLikedListIdsQuery or getLikedCommentIdsQuery
// likeUnlikeQuery: query function that takes userId and targetId and likes/unlikes targetId
// unlikeListQuery, likeListQuery, unlikeCommentQuery, likeCommentQuery
// idsProperty: "commentId" or "listId"
async function likeUnlike(userId, targetId, idsQuery, likeQuery, unlikeQuery, idProperty) {
    const likedIds = utils.getOnePropArray(await sql.poolQuery(idsQuery(userId)), idProperty);

    if (likedIds.includes(targetId)) {
        const unliked = await sql.poolQuery(unlikeQuery(userId, targetId));

        utils.checkRow(unliked);

        return "unliked";
    } else {
        const liked = await sql.poolQuery(likeQuery(userId, targetId));

        utils.checkRow(liked);

        return "liked";
    }
}

async function getListLikers(listId) {
    const likers = await sql.poolQuery(queries.getListLikersQuery(listId));

    return likers;
}

async function searchUsers(query, page, sort) {
    const users = await sql.poolQuery(
        queries.searchUsersQuery(query, utils.limitAndOffset(page, 100), utils.getSort(sort, true))
    );

    return utils.validatePage(users);
}

async function getAllUsers() {
    return await sql.poolQuery("SELECT * FROM Users");
}

module.exports = {
    createUser,
    updateUser,
    deleteUser,
    getUser,
    getUserWithName,
    follow,
    getFollowing,
    getFollowers,
    likeUnlike,
    getListLikers,
    searchUsers,
    getAllUsers,
};
