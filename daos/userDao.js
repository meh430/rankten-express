const bcrypt = require("bcryptjs");
const queries = require("../queries");

function createUser(user) {
    delete user.userId;
    delete user.dateCreated;
    delete user.rankPoints;

    user.password = bcrypt.hashSync(user.password);
}

