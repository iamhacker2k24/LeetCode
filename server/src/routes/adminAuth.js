const express = require("express")
const adminRouter = express.Router()
const { createAdmin, dismissAdmin } = require("../controlers/createAdmin")
const { CheckRole } = require("../middleWare/checkRole")

// Admin verification check (mirrors /me for admin/owner)
adminRouter.get("/admincheck", (req, res) => {
    return res.status(200).json({
        success: true,
        role: req.role,
        user: req.user,
        msg: "admin verified"
    })
})

adminRouter.post("/createAdmin", CheckRole("owner"), createAdmin)

adminRouter.post("/dismissAdmin", CheckRole("owner"), dismissAdmin)

module.exports = { adminRouter }
