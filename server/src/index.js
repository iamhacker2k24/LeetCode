require('dotenv').config()
const express = require("express");
const cookieParser = require('cookie-parser')
const connectDb = require('./config/db');
const cors = require('cors');
const { authRouter } = require('./routes/userAuth');
const { adminRouter } = require('./routes/adminAuth');
const { quesRouter } = require('./routes/quesRouter');
const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));



app.use("/api/user", authRouter)
app.use("/api/admin", adminRouter)
app.use("/api/admin/qs", quesRouter)



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