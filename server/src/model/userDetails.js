
const mongoose = require("mongoose")

const { Schema } = mongoose;

const UserDetails = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    userId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    role: {
        type: String,
        default: "Full-Stack Engineer & Competitive Programmer"
    },

    location: {
        type: String,
        default: "Global"
    },

    website: {
        type: String,
        default: ""
    },

    github: {
        type: String,
        default: ""
    },

    linkedin: {
        type: String,
        default: ""
    },

    globalRank: {
        type: Number,
        default: 0
    },

    topPercentile: {
        type: Number,
        default: 0
    },

    coins: {
        type: Number,
        default: 0,
        min: 0
    },

    streak: {
        type: Number,
        default: 0,
        min: 0
    },

    views: {
        type: Number,
        default: 0,
        min: 0
    },
    likeQuestion: {
        type: Array
    },
    dislikeQustion: {
        type: Array
    }
    , starQues: {
        type: Array
    },
    solvedQuestions: {
        type: Array
    }

}, { timestamps: true });

const userDetails = mongoose.model("userDetails", UserDetails)

module.exports = { userDetails };
