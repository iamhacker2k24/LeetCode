const jwt = require("jsonwebtoken");
const userData = require("../model/userData");
require('dotenv').config()

const middleWare = async (req, res, next) => {
    try {

        const { token } = req.cookies;
        console.log(token)
        if (!token) {
            return res.status(401).json({
                success: false,
                msg: "Unauthorized: No token provided"
            });
        }
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
        // if (findUser.role !== "admin") {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Access denied. Admin only."
        //     });
        // }
        req.role = findUser.role;
        req.user = id
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            msg: `Unauthorized: ${error.message}`
        });
    }
}

module.exports = { middleWare }