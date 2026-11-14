const express = require("express")
const { createAdmin, dismissAdmin } = require("../controlers/createAdmin")
const adminRouter = express.Router()

adminRouter.post("/createAdmin", createAdmin)

adminRouter.post("/dismissAdmin", dismissAdmin)

module.exports = { adminRouter }