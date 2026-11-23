const express = require("express");
const userDetailsRoutes = express.Router();
const { UserDetails, SolvedMap, getUniqueUsername, userStats } = require("../controlers/userControllers")
const { userMiddleWare } = require("../middleWare/userMiddleWare")

userDetailsRoutes.post("/userdetails", userMiddleWare, UserDetails)
//this router will give details of user budge ttal solve question and language solved all 
userDetailsRoutes.post("/solvedmap", SolvedMap)
//this 
userDetailsRoutes.post("/getuniqueusername", userMiddleWare, getUniqueUsername)
userDetailsRoutes.post("/userstats", userStats) // this will works on base on username ok



module.exports = { userDetailsRoutes }