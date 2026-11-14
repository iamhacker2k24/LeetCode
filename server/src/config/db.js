require('dotenv').config()
const mongoose = require("mongoose")


const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL)
        console.log("data base connected");
    } catch (error) {
        console.log(`error from db ${error.message}`)

    }
}

module.exports = connectDb;