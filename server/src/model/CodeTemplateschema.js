const mongoose = require("mongoose");

const CodeTemplateSchema = new mongoose.Schema({
    questionId: {
        type: Number,
        required: true,
        ref: "Question"
    },
    language: {
        type: String,
        required: true
    },
    initialCode: {
        type: String,
        required: true
    },
    driverCode: String,
    functionName: String
});



const codeTemplateSchema = mongoose.model("codeTemplateSchema", CodeTemplateSchema)

module.exports = { codeTemplateSchema }