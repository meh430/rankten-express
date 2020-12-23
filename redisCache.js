const redisConfig = require("./config").redisConfig;
const redis = require("redis");
const client = redis.createClient(redisConfig);

client.on("error", (error) => {
    console.error(error);
});

function inPromise(resolve, reject, error, res) {
    if (error) {
        reject(error);
    }

    resolve(res);
}

function set(key, value, ex = 3600) {
    return new Promise((resolve, reject) => {
        client.setex(key, ex, value, (error, res) => {
            inPromise(resolve, reject, error, res);
        });
    });
}

function get(key) {
    return new Promise((resolve, reject) => {
        client.get(key, (error, res) => {
            inPromise(resolve, reject, error, res);
        });
    });
}

function del(key) {
    return new Promise((resolve, reject) => {
        client.del(key, (error, res) => {
            inPromise(resolve, reject, error, res);
        });
    });
}

function bulkDelete(key, cursor = "0") {
    client.scan(cursor, "MATCH", key, (error, res) => {
        if (error) {
            throw error;
        }
        cursor = res[0];
        res[1].forEach((matchedKey) => {
            client.del(matchedKey, (err, delRes) => {
                if (err) {
                    throw err;
                }
            });
        });

        if (cursor === "0") {
            return console.log("Scan Complete");
        }

        return bulkDelete(key, cursor);
    });
}


module.exports = { set, get, del, bulkDelete };
