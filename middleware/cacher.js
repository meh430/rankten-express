const redisCache = require("../redisCache");

function getRouteCacher(slashSplit, ex = 3600, private = false) {
    const routeCacher = async (req, res, next) => {
        try {
            const keyName = private ? `user-${req.user.userId}:${req.originalUrl}` : req.originalUrl;
            const baseName = private
                ? `user-${req.user.userId}:${req.originalUrl.split("/", slashSplit).join("/")}`
                : req.originalUrl.split("/", slashSplit).join("/");

            // if refreshing, delete cached route and move on
            if (req.query.re) {
                const numDeleted = await redisCache.del(baseName + "*");
                console.log(numDeleted);
                cacheSent(res, ex);
                return next();
            }

            const cachedValue = await redisCache.get(keyName);

            if (cachedValue) {
                console.log("FROM CACHE :)");
                res.status(200).send(JSON.parse(cachedValue));
            } else {
                cacheSent(res, ex);
            }

            next();
        } catch (error) {
            return next();
        }
    };

    return routeCacher;
}

function cacheSent(res, ex) {
    console.log("CACHING...");
    const send = res.send;
    res.send = (body) => {
        redisCache
            .set(keyName, JSON.stringify(body), ex)
            .then((result) => console.log(result))
            .catch((error) => next());
        res.send = send;
        res.send(body);
    };
}

module.exports = getRouteCacher;
