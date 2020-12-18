function RankedList(listId, userId, dateCreated, title, private) {
    return { listId, userId, dateCreated, title, private };
}

const createRankedListsTable =
    "CREATE TABLE IF NOT EXISTS RankedLists(" +
    "listId int NOT NULL PRIMARY KEY AUTO_INCREMENT," +
    "userId int NOT NULL," +
    "dateCreated bigint NOT NULL," +
    "title varchar(50) NOT NULL," +
    "private bool DEFAULT false," +
    "FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE," +
    "FULLTEXT KEY (title)" +
    ")";