const queries = require("../queries");
const sql = require("../sqlPromise");
const rankItemDao = require("./rankItemDao");
const errors = require("../middleware/errorHandler");
const utils = require("../utils");

async function createRankedList(userId, rankedList) {
    const rankItems = rankedList.rankItems;
    if (rankItems.length < 1 || rankItems.length > 10) {
        throw errors.badRequest();
    }

    if (!rankedList.private) {
        rankedList.private = false;
    }

    delete rankedList.rankItems;
    delete rankedList.listId;

    rankedList.userId = userId;
    rankedList.dateCreated = Date.now();

    sql.performTransaction(async (connection) => {
        const res = await sql.query(connection, queries.createRankedListQuery(rankedList));
        for (let i = 0; i < rankItems.length; i++) {
            await rankItemDao.createRankItem(
                connection,
                rankItems[i],
                res.insertId,
                rankedList.title,
                rankedList.private
            );
        }
    });
}

async function updateRankedList(listId, userId, rankedList) {
    const rankItems = rankedList.rankItems;

    if (rankItems.length < 1 || rankItems.length > 10) {
        throw errors.badRequest();
    }

    delete rankedList.listId;
    delete rankedList.userId;
    delete rankedList.dateCreated;
    delete rankedList.rankItems;

    sql.performTransaction(async (connection) => {
        const listRes = await sql.query(connection, queries.updateRankedListQuery(rankedList, listId, userId));
        utils.checkRow(listRes);

        const currentItemIds = utils.getOnePropArray(
            await rankItemDao.getListRankItemIds(connection, listId),
            "itemId"
        );

        const givenItemIds = utils.getOnePropArray(rankItems, "itemId");

        for (let i = 0; i < currentItemIds.length; i++) {
            if (!givenItemIds.includes(currentItemIds[i])) {
                await rankItemDao.deleteRankItem(connection, currentItemIds[i]);
            }
        }

        for (let i = 0; i < rankItems.length; i++) {
            if ("itemId" in rankItems[i]) {
                if (currentItemIds.includes(rankItems[i].itemId)) {
                    await rankItemDao.updateRankItem(
                        connection,
                        rankItems[i].itemId,
                        rankItems[i],
                        rankedList.title,
                        rankedList.private
                    );
                } else {
                    throw errors.badRequest();
                }
            } else {
                await rankItemDao.createRankItem(connection, rankItems[i], listId, rankedList.title, rankedList.private);
            }
        }
    });
}

async function deleteRankedList(listId, userId) {
    await sql.poolQuery(queries.deleteRankedListQuery(listId, userId));
}

async function getRankedList(listId) {
    const [rankedList, rankItems] = await Promise.all([
        sql.poolQuery(queries.getRankedListQuery(listId)),
        sql.poolQuery(queries.getRankItemsQuery(listId)),
    ]);

    utils.checkIfFound(rankedList);

    rankedList[0].rankItems = rankItems;
    return rankedList[0];
}

async function getPreviewItem(rankedList) {
    const listId = rankedList.listId;
    const currentPreview = { ...rankedList };

    const rankItems = await rankItemDao.getListRankItems(listId);

    const items = [];
    let picture = "";

    for (let i = 0; i < rankItems.length; i++) {
        if (i < 3) {
            items.push({ itemName: rankItems[i].itemName, ranking: rankItems[i].ranking });
        } else if (picture) {
            break;
        }

        if (rankItems[i].picture && !picture) {
            picture = rankItems[i].picture;
        }
    }

    currentPreview.rankItems = items;
    currentPreview.numItems = rankItems.length;
    currentPreview.picture = picture;

    const commentPreview = await sql.poolQuery(queries.getCommentPreview(listId));

    if (commentPreview.length) {
        currentPreview.commentPreview = {
            comment: commentPreview[0].comment,
            profilePic: commentPreview[0].profilePic,
            username: commentPreview[0].username,
            userId: commentPreview[0].userId,
            dateCreated: commentPreview[0].dateCreated
        };
    }
    return currentPreview;
}

async function getRankedListPreviews(rankedLists) {
    return await Promise.all(rankedLists.map((rankedList) => getPreviewItem(rankedList)));
}

async function getDiscoverLists(page, sort) {
    const [discoverLists, itemCount] = await Promise.all([
        sql.poolQuery(queries.getDiscoverQuery(utils.limitAndOffset(page), utils.getSort(sort))),
        sql.poolQuery(queries.countDiscoveryQuery()),
    ]);


    const discoverPreviews = await getRankedListPreviews(discoverLists);
    return [discoverPreviews, itemCount[0].itemCount];
}

async function getLikedLists(userId, page, sort) {
    const [likedLists, itemCount] = await Promise.all([
        sql.poolQuery(queries.getLikedListsQuery(userId, utils.limitAndOffset(page), utils.getSort(sort))),
        sql.poolQuery(queries.countLikedListsQuery(userId)),
    ]);

    return [await getRankedListPreviews(likedLists), itemCount[0].itemCount];
}

async function getUserLists(userId, page, sort, all = false) {
    page = utils.limitAndOffset(page);
    sort = utils.getSort(sort);

    const [userLists, itemCount] = await Promise.all([
        all
            ? sql.poolQuery(queries.getAllUserRankedListsQuery(userId, page, sort))
            : sql.poolQuery(queries.getUserRankedListsQuery(userId, page, sort)),
        all
            ? sql.poolQuery(queries.countAllUserListsQuery(userId))
            : sql.poolQuery(queries.countUserListsQuery(userId)),
    ]);

    return [await getRankedListPreviews(userLists), itemCount[0].itemCount];
}

async function getFeed(userId) {
    const lastDay = Date.now() - 24 * 60 * 60 * 1000;
    const feedList = [];
    const followingIds = utils.getOnePropArray(
        await sql.poolQuery.query(queries.getFollowingIdsQuery(userId)),
        "followsId"
    );

    for (let i = 0; i < followingIds.length; i++) {
        feedList.push(
            await getRankedListPreviews(await sql.poolQuery(queries.getFeedQuery(followingIdsp[i], lastDay)))
        );
    }

    return feedList;
}

async function searchLists(query, page, sort) {
    const [searchedLists, itemCount] = await Promise.all([
        sql.poolQuery(queries.searchListsQuery(query, utils.limitAndOffset(page), utils.getSort(sort))),
        sql.poolQuery(queries.countSearchListsQuery(query)),
    ]);

    return [await getRankedListPreviews(searchedLists), itemCount[0].itemCount];
}

module.exports = {
    createRankedList,
    updateRankedList,
    deleteRankedList,
    getRankedList,
    getDiscoverLists,
    getLikedLists,
    getUserLists,
    getFeed,
    searchLists,
};
