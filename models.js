const sql = require("./sqlPromise");

const createUsersTable =
    "CREATE TABLE IF NOT EXISTS Users(" +
    "userId int NOT NULL PRIMARY KEY AUTO_INCREMENT," +
    "dateCreated bigint NOT NULL," +
    "username varchar(15) UNIQUE NOT NULL," +
    "password varchar(100) NOT NULL," +
    "bio TEXT," +
    "profilePic TEXT," +
    "rankPoints int DEFAULT 0," +
    "FULLTEXT KEY (username, bio))";

const createRankedListsTable =
    "CREATE TABLE IF NOT EXISTS RankedLists(" +
    "listId int NOT NULL PRIMARY KEY AUTO_INCREMENT," +
    "userId int NOT NULL," +
    "dateCreated bigint NOT NULL," +
    "title varchar(50) NOT NULL," +
    "private bool DEFAULT false," +
    "FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE," +
    "FULLTEXT KEY (title))";

const createRankItemsTable =
    "CREATE TABLE IF NOT EXISTS RankItems(" +
    "itemId int NOT NULL PRIMARY KEY AUTO_INCREMENT," +
    "listId int NOT NULL," +
    "listTitle varchar(50) NOT NULL," +
    "private bool DEFAULT false," +
    "ranking int NOT NULL," +
    "itemName varchar(50) NOT NULL," +
    "description TEXT," +
    "picture TEXT," +
    "FOREIGN KEY (listId) REFERENCES RankedLists(listId) ON DELETE CASCADE," +
    "FULLTEXT KEY (listTitle, itemName, description))";

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
    "likedListId int NOT NULL," +
    "FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE," +
    "FOREIGN KEY (likedListId) REFERENCES RankedLists(listId) ON DELETE CASCADE)";

const createCommentLikesTable =
    "CREATE TABLE IF NOT EXISTS CommentLikes(" +
    "userId int NOT NULL," +
    "likedCommentId int NOT NULL," +
    "FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE," +
    "FOREIGN KEY (likedCommentId) REFERENCES Comments(commentId) ON DELETE CASCADE)";

const createFollowsTable =
    "CREATE TABLE IF NOT EXISTS Follows(" +
    "userId int NOT NULL," +
    "followsId int NOT NULL," +
    "FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE)";

async function initializeTables(connection) {
    await sql.query(connection, createUsersTable);
    await sql.query(connection, createRankedListsTable);
    await sql.query(connection, createRankItemsTable);
    await sql.query(connection, commentsTable);
    await sql.query(connection, createListLikesTable);
    await sql.query(connection, createCommentLikesTable);
    await sql.query(connection, createFollowsTable);
}

module.exports = { initializeTables };
