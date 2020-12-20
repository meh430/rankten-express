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

function getRankedListPreviews(connection, rankedLists) {
    const previews = [];

    for (let i = 0; i < rankedLists.length; i++) {
        const currentPreview = {...rankedLists[i]};
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
                dateCreated: commentPreview[0].dateCreated
            };
        }

        previews.push(currentPreview);
    }

    return previews;
}
