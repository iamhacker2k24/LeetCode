
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Stats schema
const statsSchema = new Schema(
    {
        totalAccepted: { type: String, default: "0" },
        totalSubmission: { type: String, default: "0" },
        totalAcceptedRaw: { type: Number, default: 0 },
        totalSubmissionRaw: { type: Number, default: 0 },
        acRate: { type: String, default: "0%" }
    },
    { _id: false }
);

// Similar questions schema
const similarQuestionSchema = new Schema(
    {
        title: { type: String, required: true },
        titleSlug: { type: String, required: true },
        difficulty: { type: String },
        translatedTitle: { type: String, default: null }
    },
    { _id: false }
);

// Tags schema
const tagSchema = new Schema(
    {
        name: { type: String, required: true }
    },
    { _id: false }
);

// Code snippets schema
const codeSnippetSchema = new Schema(
    {
        lang: { type: String, required: true },
        langSlug: { type: String, required: true },
        code: { type: String, required: true },
        langsSlug: { type: String }
    },
    { _id: false }
);

// Main problem schema
const problemSchema = new Schema(
    {
        questionId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            default: ""
        },

        likes: {
            type: Number,
            default: 0
        },

        dislikes: {
            type: Number,
            default: 0
        },

        stats: {
            type: statsSchema,
            default: () => ({})
        },

        similarQuestions: {
            type: [similarQuestionSchema],
            default: []
        },

        categoryTitle: {
            type: String,
            default: "Algorithms"
        },

        hints: {
            type: [String],
            default: []
        },

        topicTags: {
            type: [tagSchema],
            default: []
        },

        companyTags: {
            type: [tagSchema],
            default: []
        },

        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true
        },

        isPaidOnly: {
            type: Boolean,
            default: false
        },

        codeSnippets: {
            type: [codeSnippetSchema],
            default: []
        },

        solution: {
            type: Schema.Types.Mixed,
            default: null
        },

        hasSolution: {
            type: Boolean,
            default: false
        },

        hasVideoSolution: {
            type: Boolean,
            default: false
        },

        url: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;
