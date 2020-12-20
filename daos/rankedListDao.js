const queries = require("../queries");
const sql = require("../models/sqlPromise");
const rankItemDao = require("./rankItemDao");
const utils = require("../utils");

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
    return discoverPreviews;
}

async function getLikedLists(connection, userId, page) {
    return await getRankedListPreviews(
        connection,
        await sql.query(connection, queries.getLikedListsQuery(userId, utils.limitAndOffset(page)))
    );
}

async function getUserLists(connection, userId, page, sort, all = false) {
    page = utils.limitAndOffset(page);
    sort = utils.getSort(sort);
    return await getRankedListPreviews(
        connection,
        all
            ? await sql.query(connection, queries.getAllUserRankedListsQuery(userId, page, sort))
            : await sql.query(connection, queries.getUserRankedListsQuery(userId, page, sort))
    );
}

async function getFeed(connection, userId) {
    const lastDay = Date.now() - (24 * 60 * 60 * 1000);
    const feedList = [];
    const followingIds = await sql.query(connection, queries.getFollowingIdsQuery(userId));

    followingIds.forEach(id => {
        feedList.push(await getRankedListPreviews(connection, await sql.query(connection, queries.getFeedQuery(id, lastDay))));
    });

    return feedList;
}

async function searchLists(connection, query, page, sort) {
    return await getRankedListPreviews(connection, await sql.query(connection, queries.searchListsQuery(query, utils.limitAndOffset(page), utils.getSort(sort))));
}