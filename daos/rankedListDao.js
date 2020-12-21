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

    delete rankedList.rankItems;
    delete rankedList.listId;

    rankedList.userId = userId;
    rankedList.dateCreated = Date.now();

    sql.performTransaction(async () => {
        const res = await sql.query(connection, queries.createRankedListQuery(rankedList));
        await utils.asyncForEach(rankItems, async (rankItem) => {
            await rankItemDao.createRankItem(connection, rankItem, res.insertId, rankedList.title, rankedList.private);
        });
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

    sql.performTransaction(async () => {
        const listRes = await sql.query(connection, queries.updateRankedListQuery(rankedList, listId, userId));
        utils.checkRow(listRes);

        const currentItemIds = await rankItemDao.getListRankItemIds(connection, listId);
        console.log(currentItemIds);

        const givenItemIds = utils.getOnePropArray(rankItems, "itemId");

        await utils.asyncForEach(currentItemIds, async (id) => {
            if (!givenItemIds.includes(id)) {
                await rankItemDao.deleteRankItem(connection, id);
            }
        });

        await utils.asyncForEach(rankItems, async (rankItem) => {
            if ("itemId" in rankItem) {
                if (currentItemIds.includes(rankItem.itemId)) {
                    await rankItemDao.updateRankItem(
                        connection,
                        rankItem.itemId,
                        rankItem,
                        rankedList.title,
                        rankedList.private
                    );
                } else {
                    throw errors.badRequest();
                }
            } else {
                await rankItemDao.createRankItem(connection, rankItem, listId, rankedList.title, rankedList.private);
            }
        });
    });
}

async function deleteRankedList(listId, userId) {
    await sql.poolQuery(queries.deleteRankedListQuery(listId, userId));
}

async function getRankedList(listId) {
    const [rankedList, rankItems] = await Promise.all([
        sql.poolQuery(queries.getRankedListQuery(listId), sql.poolQuery(queries.getRankItemsQuery(listId))),
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
            items.push({ itemName: rankItems[i].itemName, rank: rankItems[i].rank });
        } else if (picture) {
            break;
        }

        if (rankItems[i].picture && !picture) {
            picture = rankItems[i].picture;
        }
    }

    currentPreview.rankItems = items;
    currentPreview.numItems = numItems;
    currentPreview.picture = picture;

    const commentPreview = await sql.poolQuery(queries.getCommentPreview(listId));
    if (commentPreview.length) {
        currentPreview.commentPreview = {
            comment: commentPreview[0].comment,
            profilePic: commentPreview[0].profilePic,
            username: commentPreview[0].username,
            dateCreated: commentPreview[0].dateCreated,
        };
    }
    return currentPreview;
}

async function getRankedListPreviews(rankedLists) {
    return await Promise.all(rankedLists.map((rankedList) => getPreviewItem(rankedList)));
}

async function getDiscoverLists(page, sort) {
    const discoverLists = await sql.poolQuery(
        queries.getDiscoverQuery(utils.limitAndOffset(page), utils.getSort(sort))
    );
    console.log(discoverLists);

    const discoverPreviews = await getRankedListPreviews(discoverLists);
    console.log(discoverPreviews);
    return utils.validatePage(discoverPreviews);
}

async function getLikedLists(userId, page) {
    return utils.validatePage(
        await getRankedListPreviews(await sql.poolQuery(queries.getLikedListsQuery(userId, utils.limitAndOffset(page))))
    );
}

async function getUserLists(userId, page, sort, all = false) {
    page = utils.limitAndOffset(page);
    sort = utils.getSort(sort);
    return utils.validatePage(
        await getRankedListPreviews(
            all
                ? await sql.poolQuery(queries.getAllUserRankedListsQuery(userId, page, sort))
                : await sql.poolQuery(queries.getUserRankedListsQuery(userId, page, sort))
        )
    );
}

async function getFeed(userId) {
    const lastDay = Date.now() - 24 * 60 * 60 * 1000;
    const feedList = [];
    const followingIds = await sql.poolQuery.query(queries.getFollowingIdsQuery(userId));

    await utils.asyncForEach(followingIds, async (id) => {
        feedList.push(await getRankedListPreviews(await sql.poolQuery(queries.getFeedQuery(id, lastDay))));
    });

    return utils.validatePage(feedList);
}

async function searchLists(query, page, sort) {
    return utils.validatePage(
        await getRankedListPreviews(
            await sql.poolQuery(queries.searchListsQuery(query, utils.limitAndOffset(page), utils.getSort(sort)))
        )
    );
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
