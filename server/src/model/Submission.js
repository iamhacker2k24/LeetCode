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
    language: {
        type: String
    },
    date: {
        type: Date.now()
    }



})
const submission = mongoose.model("submission", Submission)