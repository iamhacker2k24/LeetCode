const express = require("express")
const authRouter = express.Router()
const { login, registration, logout, forgetPassword, me } = require("../controlers/userControllers")
const { CheckRole } = require("../middleWare/checkRole")
const { middleWare } = require("../middleWare/middleWare")


authRouter.post("/login", login)

authRouter.post("/registration", registration)

authRouter.get("/me", middleWare, CheckRole("user"), me) //me check user login or not 

// now lets implemts logout functions
authRouter.get("/logout", middleWare, CheckRole("user"), logout)

//forget Password i will do this later ok 
authRouter.post("/forgetpassword", middleWare, CheckRole("user"), forgetPassword)





module.exports = { authRouter }