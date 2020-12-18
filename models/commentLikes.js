const createCommentLikesTable =
    "CREATE TABLE IF NOT EXISTS CommentLikes(" +
    "userId int NOT NULL," + 
    "likedCommentId int NOT NULL," +
    "FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE," + 
    "FOREIGN KEY (likedCommentId) REFERENCES Comments(likedCommentId) ON DELETE CASCADE" +
    ")";