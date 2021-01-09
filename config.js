const dotenv = require('dotenv');
dotenv.config();

exports.jwtSecret = {
    secret: process.env.JWT_SECRET,
    algorithms: [process.env.JWT_ALGO]
};

exports.poolConfig = {
    connectionLimit: 10,
    charset: "utf8mb4",
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    supportBigNumbers: true
};

const redisConfig = { url: process.env.REDIS_URL }
if (process.env.REDIS_PASSWORD) {
    redisConfig.password = process.env.REDIS_PASSWORD;
}

exports.redisConfig = redisConfig;