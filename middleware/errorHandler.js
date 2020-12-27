function asyncError(mwFunction) {
    return (req, res, next) => {
        Promise.resolve(mwFunction(req, res, next)).catch(next);
    };
}

function errorRes(message, status) {
    return { message, status };
}

function errorHandler(err, req, res, next) {
    console.log(err.message);
    switch (err.message) {
        case "unauthorized":
            return res.status(401).send(errorRes("Invalid username or password", 401));
        case "not found":
            return res.status(400).send(errorRes("Entity not found", 400));
        case "bad request":
            return res.status(400).send(errorRes("Bad request", 400));
        case "invalid page":
            return res.status(400).send(errorRes("Trying to access a page that does not exist", 400));
        default:
            console.log(err);
            return res.status(500).send(errorRes("Something went wrong", 500));
    }
}

function authError() {
    return new Error("unauthorized");
}

function notFoundError() {
    return new Error("not found");
}

function badRequest() {
    return new Error("bad request");
}

function invalidPage() {
    return new Error("invalid page");
}

function connectionLost() {
    return new Error("PROTOCOL_CONNECTION_LOST");
}

module.exports = {
    asyncError,
    errorHandler,
    authError,
    notFoundError,
    badRequest,
    invalidPage,
    connectionLost,
};
