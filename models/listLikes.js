const createListLikesTable =
    "CREATE TABLE IF NOT EXISTS ListLikes(" +
    "userId int NOT NULL," + 
    "likedListId int NOT NULL," +
    "FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE," + 
    "FOREIGN KEY (likedListId) REFERENCES RankedLists(listId) ON DELETE CASCADE" +
    ")";