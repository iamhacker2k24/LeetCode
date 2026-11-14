const mongoose = require("mongoose");
const { Schema } = mongoose;

const Counter = new Schema({
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

const counter = mongoose.model("counter", Counter)

module.exports = counter;

// this will help to get last question serial number ok 
