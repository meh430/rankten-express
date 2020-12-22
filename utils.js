const errors = require("./middleware/errorHandler");

const sortOptions = {
    newest: "dateCreated DESC",
    oldest: "dateCreated ASC",
    likes: "numLikes DESC",
    points: "rankPoints DESC",

};

const [likes, newest, oldest, relevance] = [0, 1, 2, 3];

function limitAndOffset(page, numItems = 10) {
    return [numItems, page * numItems];
}

function getSort(sort, user = false) {

    switch (sort) {
        case likes:
            return user ? sortOptions.points : sortOptions.likes;
        case newest:
            return sortOptions.newest;
        case oldest:
            return sortOptions.oldest;
        case relevance:
            return "";
        default:
            throw errors.badRequest();
    }
}

function validatePage(results) {
    if (!results) {
        throw errors.invalidPage();
    }

    return results;
}

function checkRow(result) {
    if (result.affectedRows === 0) {
        throw errors.notFoundError();
    }
}

function checkIfFound(results) {
    if (!results.length) {
        throw errors.notFoundError();
    }
}

function getOnePropArray(objects, property) {
    return objects.map((obj) => obj[property]).filter((val) => val !== undefined);
}

async function asyncForEach(arr, callback) {
    for (i = 0; i < arr.length; i++) {
        await callback(arr[i]);
    }
}

module.exports = { limitAndOffset, getSort, validatePage, checkRow, checkIfFound, getOnePropArray, asyncForEach };
