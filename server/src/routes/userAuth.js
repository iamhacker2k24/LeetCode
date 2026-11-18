const express = require("express")
const { login, registration, logout, forgetPassword, me, UserDetails, getUniqueUsername } = require("../controlers/userControllers")
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
authRouter.post("/getuniqueusername", userMiddleWare, getUniqueUsername)


module.exports = { authRouter }