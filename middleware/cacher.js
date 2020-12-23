const redisCache = require("../redisCache");
const url = require("url");

function getRouteCacher(slashSplit, ex = 3600, private = false) {
    const routeCacher = async (req, res, next) => {
        try {
            let cleanUrl = req.originalUrl;
            if (req.query.re) {
                const currentUrl = new url.URL(
                    req.originalUrl,
                    url.format({
                        protocol: req.protocol,
                        host: req.get("host"),
                    })
                );
                currentUrl.searchParams.delete("re");
                cleanUrl = `${currentUrl.pathname}${currentUrl.search}`;
                console.log("CLEAN", cleanUrl);
            }

            const keyName = private ? `user-${req.user.userId}:${cleanUrl}` : cleanUrl;
            const baseName = private
                ? `user-${req.user.userId}:${cleanUrl.split("/", slashSplit).join("/")}`
                : cleanUrl.split("/", slashSplit).join("/");
            
            console.log("KEY", keyName);
            console.log("BASE", baseName);

            // if refreshing, delete cached route and move on
            if (req.query.re) {
                redisCache.bulkDelete(baseName + "*");
                cacheSent(res, keyName, ex);
                return next();
            }

            const cachedValue = await redisCache.get(keyName);

            if (cachedValue) {
                console.log("FROM CACHE :)");
                return res.status(200).send(JSON.parse(cachedValue));
            } else {
                cacheSent(res, keyName, ex);
            }

            next();
        } catch (error) {
            console.log("CACHE ERROR", error);
            return next();
        }
    };

    return routeCacher;
}

function cacheSent(res, keyName, ex) {
    console.log("CACHING...");
    const send = res.send;
    res.send = (body) => {
        //console.log(body);
        redisCache.set(keyName, JSON.stringify(body), ex).catch(console.log);
        res.send = send;
        res.send(body);
    };
}

module.exports = getRouteCacher;
