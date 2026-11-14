const mongoose = require("mongoose");
const { Schema } = mongoose;

const questionSchema = new Schema(
    {
        questionId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        }, slug: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true
        },
        topics: [{
            type: String,
            trim: true
        }],
        likes: {
            type: Number,
            default: 0
        },
        dislikes: {
            type: Number,
            default: 0
        },
        stats: {
            totalAccepted: {
                type: Number,
                default: 0
            },
            totalSubmissions: {
                type: Number,
                default: 0
            },
            acceptanceRate: {
                type: Number,
                default: 0
            }
        },
        constraints: [{
            type: String
        }],
        examples: [{
            input: String,
            output: String,
            explanation: String
        }],
        companies: [{
            type: String
        }],
        hints: [{
            type: String
        }],
        isPremium: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Question = mongoose.model("Question", questionSchema);


module.exports = Question;
