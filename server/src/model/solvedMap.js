
const mongoose = require("mongoose");
const { Schema } = mongoose;

const SolvedMap = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    languageSolve: {
        type: Map,
        of: Number,
        default: {}
    },
    TopicSolved: {
        type: Map,
        of: Number,
        default: {}
    },
    easySolved: {
        type: Number,
        default: 0
    },
    Medium: {
        type: Number,
        default: 0
    },
    Hard: {
        type: Number,
        default: 0
    },
    totalSubmissions: {
        type: Number,
        default: 0
    },
    acceptedSolutions: {
        type: Number,
        default: 0
    },
    currentStreak: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const solvedmap = mongoose.model("SolvedMap", SolvedMap);

module.exports = { solvedmap };