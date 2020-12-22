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

module.exports = { set, get, del };