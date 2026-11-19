// Submission Heatmap Activity
// Contest Rating History
// Recent Submissions


const mongoose = require("mongoose")

const { Schema } = mongoose;

const Submission = new Schema.create({
    userId: {
        type: String,
        require: true
    },
    solution: {
        type: String,
        require: true
    },
    date: {
        type: Date
    },
    language: {
        type: String
    }



})
const submission = mongoose.model("submission", Submission)