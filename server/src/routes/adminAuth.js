const express = require("express")
const adminRouter = express.Router()
const { createAdmin, dismissAdmin } = require("../controlers/createAdmin")




adminRouter.post("/createAdmin", createAdmin)

adminRouter.post("/dismissAdmin", dismissAdmin)

module.exports = { adminRouter }