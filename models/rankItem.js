function RankItem(itemId, listId, rank, itemName, description, picture) {
    return { itemId, listId, itemName, rank, description, picture };
}

const createRankItemsTable =
    "CREATE TABLE IF NOT EXISTS RankItems(" +
    "itemId int NOT NULL PRIMARY KEY AUTO_INCREMENT," +
    "listId int NOT NULL," +
    "listTitle varchar(50) NOT NULL," +
    "private bool DEFAULT false," + 
    "rank int NOT NULL," +
    "itemName varchar(50) NOT NULL," +
    "description TEXT," +
    "picture TEXT," +
    "FOREIGN KEY (listId) REFERENCES RankedLists(listId) ON DELETE CASCADE," +
    "FULLTEXT KEY (listTitle, itemName, description)" + 
    ")";