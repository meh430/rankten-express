const dotenv = require('dotenv');
dotenv.config();

exports.jwtSecret = {
    secret: process.env.JWT_SECRET,
    algorithms: [process.env.JWT_ALGO]
};

exports.poolConfig = {
    connectionLimit: 10,
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
    supportBigNumbers: true
};

exports.redisConfig = {};