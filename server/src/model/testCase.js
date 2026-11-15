const mongoose = require("mongoose")
const { Schema } = mongoose;

const TestCase = new Schema({
    testCaseId: {
        type: Number,
        // required: true, 
        unique: true,                   // no duplicate test case IDs
    },
    questionId: {
        type: Number,
        required: true,
        ref: "Question",                // FK → questions.questionId
    },
    questionSlug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,                     // e.g. "two-sum"
    },

    order: {
        type: Number,
        required: true,
        min: 1,                         // 1st, 2nd, 3rd test case of the question
    },

    input: {
        type: String,
        required: true,
        trim: true,                     // e.g. "nums = [2,7,11,15], target = 9"
    },

    expectedOutput: {
        type: String,
        required: true,
        trim: true,                     // e.g. "[0,1]"
    },

    explanation: {
        type: String,
        default: "",
        trim: true,                     // human-readable why output is correct
    },

    isHidden: {
        type: Boolean,
        default: false,                 // false = visible to user on question page
        // true  = hidden judge test cases only
    },

    isSample: {
        type: Boolean,
        default: true,                  // true  = shown on question page
        // false = only used during submission judging
    }
}, {
    timestamps: true,                 // createdAt + updatedAt auto managed
    collection: "testcases",
})

const testCase = mongoose.model("testCase", TestCase)
module.exports = testCase;
