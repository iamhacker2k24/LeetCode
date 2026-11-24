const express = require("express")
const adminRouter = express.Router()
const { createAdmin, dismissAdmin } = require("../controlers/createAdmin")
const { CheckRole } = require("../middleWare/checkRole")
const userData = require("../model/userData")

// Admin verification check (mirrors /me for admin/owner)
adminRouter.get("/admincheck", async (req, res) => {
    try {
        const findUser = await userData.findById(req.user).select("-password");
        return res.status(200).json({
            success: true,
            role: req.role,
            user: findUser,
            msg: "admin verified"
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
})

adminRouter.post("/createAdmin", CheckRole("owner"), createAdmin)

adminRouter.post("/dismissAdmin", CheckRole("owner"), dismissAdmin)

module.exports = { adminRouter }
