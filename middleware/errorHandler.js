function authError() {
    return new Error("unauthorized");
}

function notFoundError() {
    return new Error("not found");
}

function invalidCredentialsError() {
    return new Error("invalid credentials");
}

module.exports = { authError, notFoundError, invalidCredentialsError };