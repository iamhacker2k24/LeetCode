require('dotenv').config()
const express = require("express");
const cookieParser = require('cookie-parser')
const connectDb = require('./config/db');
const cors = require('cors');
const { authRouter } = require('./routes/userAuth');
const { adminRouter } = require('./routes/adminAuth');
const { quesRouter } = require('./routes/quesRouter');
const { submittionRouter } = require('./routes/submittionRouter');
const { userDetailsRoutes } = require('./routes/userDetailsRoutes');
const { middleWare } = require('./middleWare/middleWare');
const { CheckRole } = require('./middleWare/checkRole');


const app = express();
app.use(express.json());
app.use(cookieParser())


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));




//authRouter
app.use("/api/user", authRouter)

app.use("/api/admin/qs", quesRouter)
app.use("/api/admin", middleWare, CheckRole("admin", "owner"), adminRouter)




//question solved router 
app.use("/api/user/qs", middleWare, CheckRole("user"), submittionRouter)



//userDetailsRouter
app.use("/api/user/details", middleWare, userDetailsRoutes)



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