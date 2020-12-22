function parseParameters(req, res, next) {
    req.params.userId = Number(req.params.userId);
    req.params.listId = Number(req.params.listId);
    req.params.commentId = Number(req.params.commentId);
    req.params.page = Number(req.params.page);
    req.params.sort = Number(req.params.sort);

    next();
}

module.exports = { parseParameters };