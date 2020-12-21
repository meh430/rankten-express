function errorMiddleWare(connection) {
    return {
        checkConnection: (req, res, next) => {
            if (connection.state === "disconnected") {
                next(connectionLost());
                return;
            }

            next();
        },
        asyncError: (mwFunction) => {
            return ((req, res, next) => {
                Promise.resolve(mwFunction(req, res, next)).catch(next);
            });
        },
        errorHandler: (req, res, next) => res.status(500).send("TODO")
    };
}

function authError() {
    return new Error("unauthorized");
}

function notFoundError() {
    return new Error("not found");
}

function invalidCredentialsError() {
    return new Error("invalid credentials");
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

module.exports = { errorMiddleWare, authError, notFoundError, invalidCredentialsError, badRequest, invalidPage, connectionLost };
