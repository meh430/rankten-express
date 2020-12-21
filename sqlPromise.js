const util = require("util");
const pool = require("./pool");

// for queries that need to share the connection. Transactions?
// use pool.query() for other queries where parallel is ok
const getConnection = async () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error) {
                reject(error);
            }

            resolve(connection);
        })
    })
}

const poolQuery = async (sqlQuery) => {
    return new Promise((resolve, reject) => {
        pool.query(sqlQuery, (err, results, fields) => {
            if (err) {
                reject(err);
            }

            resolve(results);
        });
    });
}

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

module.exports = { poolQuery, query, queryValues, connect, transaction, getConnection };
