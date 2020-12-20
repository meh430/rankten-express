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

module.exports = { authError, notFoundError, invalidCredentialsError, badRequest };