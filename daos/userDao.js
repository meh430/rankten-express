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
    console.log(res);
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
    console.log(res);

    utils.checkRow(res);
}

async function deleteUser(userId) {
    sql.performTransaction(async () => {
        const res = await sql.query(connection, queries.deleteUserQuery(userId));
        console.log(res);

        utils.checkRow(res);

        await sql.query(connection, queries.deleteFromFollowersQuery(userId));
    });
}

async function getUser(userId, private) {
    let userInfo = await sql.poolQuery(queries.getUserQuery(userId));
    console.log(userInfo);

    utils.checkIfFound(userInfo);
    userInfo = userInfo[0];

    if (private) {
        const [following, likedLists, likedComments] = await Promise.all([
            sql.poolQuery(queries.getFollowingIdsQuery(userId)),
            sql.poolQuery(queries.getLikedListIdsQuery(userId)),
            sql.poolQuery(queries.getLikedCommentIdsQuery(userId)),
        ]);

        return { ...userInfo, following, likedLists, likedComments };
    }

    return userInfo;
}

async function userExists(username) {
    return (await sql.poolQuery(queries.getUserWithNameQuery(username))).length > 0;
}

async function follow(userId, targetId) {
    if (userId === targetId) {
        throw errors.badRequest();
    }

    const following = await sql.poolQuery(queries.getFollowingIdsQuery(userId));

    if (following.includes(targetId)) {
        const unfollowed = await sql.poolQuery(queries.unfollowQuery(userId, targetId));
        console.log(unfollowed);

        utils.checkRow(unfollowed);

        return "unfollowed user";
    } else {
        const followed = await sql.poolQuery(queries.followQuery(userId, targetId));
        console.log(followed);

        utils.checkRow(followed);

        return "followed user";
    }
}

async function getFollowing(userId) {
    const following = await sql.poolQuery(queries.getFollowingQuery(userId));
    console.log(following);

    return following;
}

async function getFollowers(userId) {
    const followers = await sql.poolQuery(queries.getFollowersQuery(userId));
    console.log(followers);

    return followers;
}

async function likeUnlike(userId, targetId, query) {
    await sql.query(query(userId, targetId));
}

async function getListLikers(listId) {
    const likers = await sql.poolQuery(queries.getListLikersQuery(listId));
    console.log(likers);

    return likers;
}

async function searchUsers(query, page, sort) {
    const users = await sql.poolQuery(
        queries.searchUsersQuery(query, utils.limitAndOffset(page, 100), utils.getSort(sort, true))
    );
    console.log(users);

    return utils.validatePage(users);
}

module.exports = {
    createUser,
    updateUser,
    deleteUser,
    getUser,
    userExists,
    follow,
    getFollowing,
    getFollowers,
    likeUnlike,
    getListLikers,
    searchUsers,
};
