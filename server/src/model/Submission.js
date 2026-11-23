// Submission Heatmap Activity
// Contest Rating History
// Recent Submissions


const mongoose = require("mongoose")

const { Schema } = mongoose;

const Submission = new Schema({
    userId: {
        type: String,
        required: true
    },
    solution: {
        type: String,
        required: true
    },
    language: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }

})
const submission = mongoose.model("submission", Submission)

module.exports = { submission }