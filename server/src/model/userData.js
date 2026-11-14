const mongoose = require("mongoose")
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        minLegth: 2,
        maxLength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true
    },
    password: {
        type: String,
        required: true

    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
        
    }
}, {
    timestamps: true
})

const userModel = moongose.model("userData", userSchema)
module.exports = userModel;