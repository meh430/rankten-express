const createFollowsTable =
    "CREATE TABLE IF NOT EXISTS Follows(" +
    "userId int NOT NULL," + 
    "followsId int NOT NULL," +
    "FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE" + 
    "FOREIGN KEY (followsId) REFERENCES Users(userId) ON DELETE CASCADE" + 
    ")";