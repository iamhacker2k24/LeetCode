const express = require("express")
const adminRouter = express.Router()
const { createAdmin, dismissAdmin } = require("../controlers/createAdmin")
const { adminMiddleWare } = require("../middleWare/adminMiddleWare")




adminRouter.post("/createAdmin", adminMiddleWare, createAdmin)

adminRouter.post("/dismissAdmin", adminMiddleWare, dismissAdmin)

module.exports = { adminRouter }