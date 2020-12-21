const queries = require("../queries");
const sql = require("../sqlPromise");
const utils = require("../utils");

async function createRankItem(connection, rankItem, listId, listTitle, private) {
    delete rankItem.itemId;

    rankItem.listId = listId;
    rankItem.listTitle = listTitle;
    rankItem.private = private;

    const res = await sql.query(connection, queries.createRankItemQuery(rankItem));
    console.log(res);

    return res.insertId;
}

async function updateRankItem(connection, itemId, rankItem, listTitle, private) {
    delete rankItem.itemId;
    delete rankItem.listId;

    rankItem.listTitle = listTitle;
    rankItem.private = private;

    const res = await sql.query(connection, queries.updateRankItemQuery(rankItem, itemId));
    console.log(res);

    utils.checkRow(res);
}

async function deleteRankItem(connection, itemId) {
    const res = await sql.query(connection, queries.deleteRankItemQuery(itemId));
    console.log(res);

    utils.checkRow(res);
}

async function deleteListRankItems(connection, listId) {
    const res = await sql.query(connection, queries.deleteListRankItemsQuery(listId));
    console.log(res);

    utils.checkRow(res);
}

async function getListRankItems(listId) {
    const rankItems = await sql.poolQuery(queries.getRankItemsQuery(listId));
    console.log(rankItems);

    return rankItems;
}

async function getListRankItemIds(connection, listId) {
    const rankItemIds = await sql.query(connection, queries.getRankItemIds(listId));
    console.log(rankItemIds);

    return rankItemIds;
}

module.exports = {
    createRankItem,
    updateRankItem,
    deleteRankItem,
    deleteListRankItems,
    getListRankItems,
    getListRankItemIds,
};
