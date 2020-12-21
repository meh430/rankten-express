const queries = require("../queries");
const sql = require("../sqlPromise");
const rankItemDao = require("./rankItemDao");
const errors = require("../middleware/errorHandler");
const utils = require("../utils");

async function createRankedList(connection, userId, rankedList) {
    const transaction = sql.transaction(connection);

    const rankItems = rankedList.rankItems;
    if (rankItems.length < 1 || rankItems.length > 10) {
        throw errors.badRequest();
    }

    delete rankedList.rankItems;
    delete rankedList.listId;

    rankedList.userId = userId;
    rankedList.dateCreated = Date.now();

    try {
        await transaction.beginTransaction();

        const res = await sql.query(connection, queries.createRankedListQuery(rankedList));
        await utils.asyncForEach(rankItems, async (rankItem) => {
            await rankItemDao.createRankItem(connection, rankItem, res.insertId, rankedList.title, rankedList.private);
        });

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function updateRankedList(connection, listId, userId, rankedList) {
    const transaction = sql.transaction(connection);

    const rankItems = rankedList.rankItems;

    if (rankItems.length < 1 || rankItems.length > 10) {
        throw errors.badRequest();
    }

    delete rankedList.listId;
    delete rankedList.userId;
    delete rankedList.dateCreated;
    delete rankedList.rankItems;

    try {
        await transaction.beginTransaction();

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

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function deleteRankedList(connection, listId, userId) {
    await sql.query(connection, queries.deleteRankedListQuery(listId, userId));
}

async function getRankedList(connection, listId) {
    let rankedList = await sql.query(connection, queries.getRankedListQuery(listId));
    utils.checkIfFound(rankedList);
    rankedList = rankedList[0];

    const rankItems = await sql.query(connection, queries.getRankItemsQuery(listId));

    rankedList.rankItems = rankItems;

    return rankedList;
}

async function getPictureAndThree(connection, listId) {
    const rankItems = await rankItemDao.getListRankItems(connection, listId);

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

    return [items, numItems, picture];
}

async function getRankedListPreviews(connection, rankedLists) {
    const previews = [];

    for (let i = 0; i < rankedLists.length; i++) {
        const currentPreview = { ...rankedLists[i] };
        const [rankItems, numItems, picture] = getPictureAndThree(connection, rankedLists[i].listId);
        currentPreview.rankItems = rankItems;
        currentPreview.numItems = numItems;
        currentPreview.picture = picture;

        const commentPreview = await sql.query(connection, queries.getCommentPreview(rankedLists[i].listId));
        console.log(commentPreview);
        if (commentPreview) {
            currentPreview.commentPreview = {
                comment: commentPreview[0].comment,
                profilePic: commentPreview[0].profilePic,
                username: commentPreview[0].username,
                dateCreated: commentPreview[0].dateCreated,
            };
        }

        previews.push(currentPreview);
    }

    return previews;
}

async function getDiscoverLists(connection, page, sort) {
    const discoverLists = await sql.query(
        connection,
        queries.getDiscoverQuery(utils.limitAndOffset(page), utils.getSort(sort))
    );
    console.log(discoverLists);

    const discoverPreviews = await getRankedListPreviews(connection, discoverLists);
    console.log(discoverPreviews);
    return utils.validatePage(discoverPreviews);
}

async function getLikedLists(connection, userId, page) {
    return utils.validatePage(await getRankedListPreviews(
        connection,
        await sql.query(connection, queries.getLikedListsQuery(userId, utils.limitAndOffset(page)))
    ));
}

async function getUserLists(connection, userId, page, sort, all = false) {
    page = utils.limitAndOffset(page);
    sort = utils.getSort(sort);
    return utils.validatePage(await getRankedListPreviews(
        connection,
        all
            ? await sql.query(connection, queries.getAllUserRankedListsQuery(userId, page, sort))
            : await sql.query(connection, queries.getUserRankedListsQuery(userId, page, sort))
    ));
}

async function getFeed(connection, userId) {
    const lastDay = Date.now() - 24 * 60 * 60 * 1000;
    const feedList = [];
    const followingIds = await sql.query(connection, queries.getFollowingIdsQuery(userId));

    await utils.asyncForEach(followingIds, async (id) => {
        feedList.push(
            await getRankedListPreviews(connection, await sql.query(connection, queries.getFeedQuery(id, lastDay)))
        );
    });

    return utils.validatePage(feedList);
}

async function searchLists(connection, query, page, sort) {
    return utils.validatePage(await getRankedListPreviews(
        connection,
        await sql.query(connection, queries.searchListsQuery(query, utils.limitAndOffset(page), utils.getSort(sort)))
    ));
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
