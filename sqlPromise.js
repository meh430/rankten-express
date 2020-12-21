const util = require("util");

const query = async(connection, sqlQuery) => {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, (err, results, fields) => {
            if (err) {
                reject(err);
            }

            resolve(results);
        });
    });
};

const queryValues = async(connection, sqlQuery, values) => {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, values, (err, results, fields) => {
            if (err) {
                reject(err);
            }

            resolve(results);
        });
    });
};

const connect = async(connection) => {
    return new Promise((resolve, reject) => {
        connection.connect((err) => {
            if (err) {
                reject(err);
            }

            resolve("connected!");
        });
    });
};

const transaction = async(connection) => {
    return {
        async beginTransaction() {
            return util.promisify(connection.beginTransaction).call(connection);
        },
        async commit() {
            return util.promisify(connection.commit).call(connection);
        },
        async rollback() {
            return util.promisify(connection.rollback).call(connection);
        },
    };
};

module.exports = { query, queryValues, connect, transaction };
