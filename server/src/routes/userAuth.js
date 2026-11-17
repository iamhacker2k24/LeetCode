const express = require("express")
const { login, registration, logout, forgetPassword } = require("../controlers/userControllers")
const authRouter = express.Router()

authRouter.post("/login", login)

authRouter.post("/registration", registration)

// now lets implemts logout functions
authRouter.get("/logout", logout)

//forget Password i will do this later ok 

authRouter.post("/forgetpassword", forgetPassword)


module.exports = { authRouter }