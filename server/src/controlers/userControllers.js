const userData = require("../model/userData")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
// const cookie = require('cookie-parser')
const login = async (req, res) => {
    try {
        let { name, email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                msg: "Please provide all required information."
            });
        }
        email = email.trim().toLowerCase()
        const exists = await userData.findOne({ email })

        if (!exists) {
            return res.status(400).json({
                sucess: false,
                msg: "not  exists your account pls registered first "

            })
        }

        //compare pasword 
        const match = await bcrypt.compare(password, exists.password);

        console.log(match)
        if (!match) {
            return res.status(400).json({
                sucess: false,
                msg: "wrong email or password"

            })
        }

        //now save this data to the datbase ok 
        // Generate JWT

        const token = jwt.sign(
            {
                id: exists._id,
                role: exists.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        );
        // console.log(token)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });
        return res.status(200).json({
            success: true,
            msg: exists
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            msg: `error from registration ${error.message}`
        })
    }

}
const registration = async (req, res) => {
    try {
        let { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                msg: "Please provide all required information."
            });
        }
        const role = "user"
        email = email.trim().toLowerCase()
        const exists = await userData.findOne({ email })

        if (exists) {
            return res.status(409).json({
                sucess: true,
                msg: "alreday exists your mail"

            })
        }

        //convert pass to hex 
        password = await bcrypt.hash(password, saltRounds);

        // console.log(password)

        //now save this data to the datbase ok 

        const result = await userData.create({
            name: name.trim(),
            email: email,
            password,
            role

        })
        // console.log(result)

        // Generate JWT
        const token = jwt.sign(
            {
                id: result._id,
                role: result.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        );
        // console.log(token)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });
        return res.status(200).json({
            success: true,
            msg: result
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            msg: `error from registration ${error.message}`
        })
    }

}

module.exports = { login, registration }