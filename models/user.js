const bcrypt = require("bcryptjs");

function User(userId, dateCreated, username, password, bio, profilePic, rankPoints) {
    return {
        userId: userId,
        dateCreated: dateCreated,
        username: username,
        password: bcrypt.hashSync(password),
        bio: bio,
        profilePic: profilePic,
        rankPoints: rankPoints,
    };
}

const createUsersTable =
    "CREATE TABLE IF NOT EXISTS Users(" +
    "userId int NOT NULL PRIMARY KEY AUTO_INCREMENT," +
    "dateCreated bigint NOT NULL," +
    "username varchar(15) NOT NULL," +
    "password varchar(100) NOT NULL," +
    "bio TEXT," +
    "profilePic TEXT," +
    "rankPoints int DEFAULT 0," +
    "FULLTEXT KEY (username, bio)"
    ")";