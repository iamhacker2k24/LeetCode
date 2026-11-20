const mongoose = require("mongoose");
const { Schema } = mongoose;

const TestCaseCounter = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    sequence: {
        type: Number,
        default: 0
    }
});

const testCaseCounter = mongoose.model("testCaseCounter", TestCaseCounter)

module.exports = testCaseCounter;

// this will help to get last testCse  serial number ok 




