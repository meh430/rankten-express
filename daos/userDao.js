const bcrypt = require("bcryptjs");
const queries = require("../queries");
const sql = require("../models/sqlPromise");
const errors = require("../middleware/errorHandler");
const utils = require("../utils");

const namePattern = /^[a-z0-9_-]{3,15}$/g;
const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/g;

async function createUser(connection, user) {
    delete user.userId;
    delete user.dateCreated;
    delete user.rankPoints;

    if (!user.username.match(namePattern) || !user.password.match(passwordPattern)) {
        throw errors.invalidCredentialsError();
    }

    user.password = bcrypt.hashSync(user.password);

    const res = await sql.query(connection, queries.createUserQuery(user));
    console.log(res);
    return res.insertId;
}

async function updateUser(connection, userId, user) {
    delete user.userId;
    delete user.dateCreated;
    delete user.rankPoints;

    if ("password" in user) {
        user.password = bcrypt.hashSync(user.password);
    }

    const res = await sql.query(connection, queries.updateUserQuery(userId, user));
    console.log(res);

    if (res.affectedRows === 0) {
        throw errors.notFoundError();
    }
}

async function deleteUser(connection, userId) {
    const res = await sql.query(connection, queries.deleteUserQuery(userId));
    console.log(res);

    if (res.dateCreated === 0) {
        throw errors.notFoundError();
    }
}

async function getUser(connection, userId, private) {
    const userInfo = await sql.query(connection, queries.getUserQuery(userId));
    console.log(userInfo);

    if (private) {
        const following = await sql.query(connection, queries.getFollowingIdsQuery(userId));
        const likedLists = await sql.query(connection, queries.getLikedListIdsQuery(userId));
        const likedComments = await sql.query(connection, queries.getLikedCommentIdsQuery(userId));

        console.log({ userInfo, following, likedLists, likedComments });

        return { userInfo, following, likedLists, likedComments };
    }

    return userInfo;
}

async function follow(connection, userId, targetId) {
    const following = await sql.query(connection, queries.getFollowingIdsQuery(userId));

    if (following.includes(targetId)) {
        const unfollowed = await sql.query(connection, queries.unfollowQuery(userId, targetId));
        console.log(unfollowed);

        if (unfollowed.affectedRows === 0) {
            throw errors.notFoundError();
        }

        return "unfollowed user";
    } else {
        const followed = await sql.query(connection, queries.followQuery(userId, targetId));
        console.log(followed);

        if (followed.affectedRows === 0) {
            throw errors.notFoundError();
        }

        return "followed user";
    }
}

async function getFollowing(connection, userId) {
    const following = await sql.query(connection, queries.getFollowingQuery(userId));
    console.log(following);

    return following;
}

async function getFollowers(connection, userId) {
    const followers = await sql.query(connection, queries.getFollowersQuery(userId));
    console.log(followers);

    return followers;
}

async function getListLikers(connection, listId) {
    const likers = await sql.query(connection, queries.getListLikersQuery(listId));
    console.log(likers);

    return likers;
}

async function searchUsers(connection, query, page, sort) {
    const users = await sql.query(connection, queries.searchUsersQuery(query, utils.limitAndOffset(page), utils.getSort(sort)));
    console.log(users);

    return utils.validatePage(users);
}

module.exports = { createUser, updateUser, deleteUser, getUser, follow, getFollowing, getFollowers, getListLikers, searchUsers };
