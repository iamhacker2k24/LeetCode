require('dotenv').config()
const express = require("express");
const connectDb = require('./config/db');
const { authRouter } = require('./routes/userAuth');
const { adminRouter } = require('./routes/adminAuth');

const { quesRouter } = require('./routes/quesRouter');
const app = express();
app.use(express.json());




app.use("/api/user", authRouter)
app.use("/api/admin",adminRouter)
app.use("/api/admin/qs",quesRouter)



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