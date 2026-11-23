const express = require("express")
const authRouter = express.Router()
const { login, registration, logout, forgetPassword, me } = require("../controlers/userControllers")
const { userMiddleWare } = require("../middleWare/userMiddleWare")


authRouter.post("/login", login)

authRouter.post("/registration", registration)

authRouter.get("/me", userMiddleWare, me) //me check user login or not 

// now lets implemts logout functions
authRouter.get("/logout", userMiddleWare, logout)

//forget Password i will do this later ok 
authRouter.post("/forgetpassword", userMiddleWare, forgetPassword)




















module.exports = { authRouter }