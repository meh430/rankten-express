const errors = require("./middleware/errorHandler");

const sortOptions = {
    newest: "dateCreated DESC",
    oldest: "dateCreated ASC",
    likes: "numLikes DESC",
    points: "rankPoints DESC"
}

const likes, newest, oldest = [0, 1, 2];

function limitAndOffset(page, numItems = 10) {
    return [10, page*numItems];
}

function getSort(sort, user = false) {
    switch (sort) {
        case likes:
            return user ? sortOptions.points : sortOptions.likes;
        case newest:
            return sortOptions.newest;
        case oldest:
            return sortOptions.oldest;
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

module.exports = { limitAndOffset, getSort, validatePage };