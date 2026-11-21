
const mongoose = require("mongoose")

const { Schema } = mongoose;

const SolvedMap = new Schema({
    userId: {
        type: String,
        require: true,
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
        type: Number
    },
    Medium: {
        type: Number
    },
    Hard: {
        type: Number
    },
    totalSubmissions: {
        type: Number
    },
    acceptedSolutions: {
        type: Number
    },
    currentStreak: {
        type: Number
    }


})
const solvedmap = mongoose.model("SolvedMap", SolvedMap)

module.exports = { solvedmap }