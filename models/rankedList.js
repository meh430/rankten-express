const mongoose = require("mongoose");

// TODO: implement delete rules
const rankedListSchema = new mongoose.Schema({
    date_created: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    user_name: { type: String, required: true },
    private: { type: Boolean, default: false },
    title: { type: String, required: true },
    rank_list: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "RankItem" }],
        validate: [(val) => val.length <= 10, '{PATH} can have 10 items max']
    },
    num_likes: { type: Number, default: 0 },
    liked_users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    num_comments: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
});

// TODO: middleware

module.exports = mongoose.model("RankedList", schema);