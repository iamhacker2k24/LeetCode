require('dotenv').config()
const express = require("express");
const connectDb = require('./config/db');
const app = express();

app.use(express.json());




const main = async () => {
    try {
        await connectDb();
        app.listen(process.env.PORT, () => {
            console.log(process.env.PORT)
            console.log("server started ")
        })
    } catch (error) {
        console.log(`error from index.js ${error.message}`)
    }
}


main();