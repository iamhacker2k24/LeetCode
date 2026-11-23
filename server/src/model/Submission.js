// Submission Heatmap Activity
// Contest Rating History
// Recent Submissions

const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubmissionSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    questionId: {
        type: Number,
        required: true,
        index: true
    },
    solution: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    verdict: {
        type: String,
        default: "Pending"
    },
    score: {
        type: Number,
        default: 0
    },
    passedTests: {
        type: Number,
        default: 0
    },
    totalTests: {
        type: Number,
        default: 0
    },
    timeTaken: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const submission = mongoose.model("submission", SubmissionSchema);

module.exports = { submission };
