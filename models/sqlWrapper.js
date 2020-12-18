const query = (connection, sqlQuery) => {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, (err, results, fields) => {
            if (err) {
                reject(err);
            }

            resolve(results);
        })
    });
}

const queryValues = (connection, sqlQuery, values) => {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, values, (err, results, fields) => {
            if (err) {
                reject(err);
            }

            resolve(results);
        })
    });
}