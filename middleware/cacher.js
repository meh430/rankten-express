const redisCache = require("../redisCache");

function getRouteCacher(slashSplit, ex = 3600) {
    const routeCacher = async (req, res, next) => {
        try {
            const keyName = req.originalUrl;
            const baseName = req.originalUrl.split("/", slashSplit).join("/");

            // if refreshing, delete cached route and move on
            if (req.params.re) {
                const numDeleted = await redisCache.del(baseName + "*");
                console.log(numDeleted);
                return next();
            }

            const cachedValue = await redisCache.get(keyName);

            if (cachedValue) {
                res.status(200).send(JSON.parse(cachedValue));
            } else {
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

            next();
        } catch (error) {
            return next();
        }
    };
}