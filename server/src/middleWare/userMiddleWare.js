const jwt = require("jsonwebtoken");
const userData = require("../model/userData");
require('dotenv').config()

const userMiddleWare = async (req, res, next) => {
    try {

        const { token } = req.cookies;
        // console.log(token)
        const payload = await jwt.verify(token, process.env.JWT_SECRET)

        const { id } = payload;
        if (!id) {
            return res.status(400).json({
                success: false,
                msg: "error from token"
            })
        }
        const findUser = await userData.findById(id)
        if (!findUser) {
            return res.status(400).json({
                success: false,
                msg: "error from token"
            })
        }
        console.log("verifed user")

        req.user = id
        next();
    } catch (error) {
        res.send("Unauthorized: Invalid or missing token")
    }
}

module.exports = { userMiddleWare }