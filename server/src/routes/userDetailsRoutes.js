const express = require("express");
const userDetailsRoutes = express.Router();
const { UserDetails, SolvedMap, getUniqueUsername, userStats } = require("../controlers/userControllers")

const { CheckRole } = require("../middleWare/checkRole");

userDetailsRoutes.post("/userdetails", UserDetails)
//this router will give details of user budge ttal solve question and language solved all 

//this 
userDetailsRoutes.post("/getuniqueusername", CheckRole("user"), getUniqueUsername)

userDetailsRoutes.post("/userstats/:username", userStats) // this will works on base on username ok

userDetailsRoutes.post("/SolvedMap/:username", SolvedMap) // this will works on base on username ok




module.exports = { userDetailsRoutes }