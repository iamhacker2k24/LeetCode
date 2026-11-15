const mongoose = require("mongoose");

const CodeTemplateSchema = new mongoose.Schema({
    questionId: {
        type: Number,
        required: true,
        unique: true
    },
    python: {
        type: String,
        required: true
    },
    C: {
        type: String,
        required: true
    },
    java: {
        type: String,
        required: true
    },
    cpp: {
        type: String,
        required: true
    }

});



const codeTemplateSchema = mongoose.model("codeTemplateSchema", CodeTemplateSchema)

module.exports = codeTemplateSchema 