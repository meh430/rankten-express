const util = require("util");

const query = (connection, sqlQuery) => {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, (err, results, fields) => {
            if (err) {
                reject(err);
            }

            resolve(results);
        });
    });
};

const queryValues = (connection, sqlQuery, values) => {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, values, (err, results, fields) => {
            if (err) {
                reject(err);
            }

            resolve(results);
        });
    });
};


const transaction = (connection) => {
    return {
        beginTransaction() {
            return util.promisify(connection.beginTransaction).call(connection);
        },
        commit() {
            return util.promisify(connection.commit).call(connection);
        },
        rollback() {
            return util.promisify(connection.rollback).call(connection);
        }
    };
};

module.exports = { query, queryValues, transaction};
