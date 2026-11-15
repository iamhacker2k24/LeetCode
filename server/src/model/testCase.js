const mongoose = require("mongoose")
const { Schema } = mongoose;

const TestCase = new Schema({

})

const testCase = mongoose.model("testCase", TestCase)
module.exports = testCase;
