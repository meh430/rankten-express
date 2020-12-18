function Comment(commentId, userId, listId, dateCreated, comment) {
    return { commentId, userId, listId, dateCreated, comment };
}

const commentsTable =
    "CREATE TABLE IF NOT EXISTS Comments(" +
    "commentId int NOT NULL PRIMARY KEY AUTO_INCREMENT," +
    "userId int NOT NULL," +
    "listId int NOT NULL," +
    "dateCreated bigint NOT NULL," +
    "comment TEXT NOT NULL," +
    "FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE," +
    "FOREIGN KEY (listId) REFERENCES RankedLists(listId) ON DELETE CASCADE," +
    ")";