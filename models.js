const sql = require("./sqlPromise");

const tableSettings = " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;";

const createUsersTable =
    "CREATE TABLE IF NOT EXISTS Users(" +
    "userId int NOT NULL PRIMARY KEY AUTO_INCREMENT," +
    "dateCreated bigint NOT NULL," +
    "username varchar(15) UNIQUE NOT NULL," +
    "password varchar(100) NOT NULL," +
    "bio TEXT," +
    "profilePic TEXT," +
    "rankPoints int DEFAULT 0)";

const createRankedListsTable =
    "CREATE TABLE IF NOT EXISTS RankedLists(" +
    "listId int NOT NULL PRIMARY KEY AUTO_INCREMENT," +
    "userId int NOT NULL," +
    "dateCreated bigint NOT NULL," +
    "title varchar(50) NOT NULL," +
    "private bool NOT NULL DEFAULT 0," +
    "FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE)";

const createRankItemsTable =
    "CREATE TABLE IF NOT EXISTS RankItems(" +
    "itemId int NOT NULL PRIMARY KEY AUTO_INCREMENT," +
    "listId int NOT NULL," +
    "listTitle varchar(50) NOT NULL," +
    "private bool NOT NULL DEFAULT 0," +
    "ranking int NOT NULL," +
    "itemName varchar(50) NOT NULL," +
    "description TEXT," +
    "picture TEXT," +
    "FOREIGN KEY (listId) REFERENCES RankedLists(listId) ON DELETE CASCADE)";

const commentsTable =
    "CREATE TABLE IF NOT EXISTS Comments(" +
    "commentId int NOT NULL PRIMARY KEY AUTO_INCREMENT," +
    "userId int NOT NULL," +
    "listId int NOT NULL," +
    "dateCreated bigint NOT NULL," +
    "comment TEXT NOT NULL," +
    "FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE," +
    "FOREIGN KEY (listId) REFERENCES RankedLists(listId) ON DELETE CASCADE)";

const createListLikesTable =
    "CREATE TABLE IF NOT EXISTS ListLikes(" +
    "userId int NOT NULL," +
    "listId int NOT NULL," +
    "FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE," +
    "FOREIGN KEY (listId) REFERENCES RankedLists(listId) ON DELETE CASCADE)";

const createCommentLikesTable =
    "CREATE TABLE IF NOT EXISTS CommentLikes(" +
    "userId int NOT NULL," +
    "commentId int NOT NULL," +
    "FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE," +
    "FOREIGN KEY (commentId) REFERENCES Comments(commentId) ON DELETE CASCADE)";

const createFollowsTable =
    "CREATE TABLE IF NOT EXISTS Follows(" +
    "userId int NOT NULL," +
    "followsId int NOT NULL," +
    "FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE)";

function appendSettings(table) {
    return table + tableSettings;
}

async function initializeTables(connection) {
    await sql.query(connection, appendSettings(createUsersTable));
    await sql.query(connection, appendSettings(createRankedListsTable));
    await sql.query(connection, appendSettings(createRankItemsTable));
    await sql.query(connection, appendSettings(commentsTable));
    await sql.query(connection, appendSettings(createListLikesTable));
    await sql.query(connection, appendSettings(createCommentLikesTable));
    await sql.query(connection, appendSettings(createFollowsTable));
}

module.exports = { initializeTables };
