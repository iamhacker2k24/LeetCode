const express = require("express")
const { login, registration, logout, forgetPassword, me, UserDetails, getUniqueUsername, userStats, SolvedMap } = require("../controlers/userControllers")
const { userMiddleWare } = require("../middleWare/userMiddleWare")
const authRouter = express.Router()

authRouter.post("/login", login)

authRouter.post("/registration", registration)



// /me.
authRouter.get("/me", userMiddleWare, me)


// now lets implemts logout functions

authRouter.get("/logout", userMiddleWare, logout)

//forget Password i will do this later ok 

authRouter.post("/forgetpassword", userMiddleWare, forgetPassword)
authRouter.post("/userdetails", userMiddleWare, UserDetails)


//this router will give details of user budge ttal solve question and language solved all 
authRouter.post("/solvedmap", SolvedMap)


//this 
authRouter.post("/getuniqueusername", userMiddleWare, getUniqueUsername)
authRouter.post("/userstats", userStats) // this will works on base on username ok


module.exports = { authRouter }