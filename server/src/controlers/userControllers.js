const userData = require("../model/userData")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { userDetails } = require("../model/userDetails");
const { solvedMap, solvedmap } = require("../model/solvedMap");
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
                success: false,
                msg: "not  exists your account pls registered first "

            })
        }

        //compare pasword 
        const match = await bcrypt.compare(password, exists.password);

        console.log(match)
        if (!match) {
            return res.status(400).json({
                success: false,
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
        let { email, password } = req.body
        if (!email || !password) {
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
                success: true,
                msg: "alreday exists your mail"

            })
        }

        //convert pass to hex 
        password = await bcrypt.hash(password, saltRounds);

        // console.log(password)

        //now save this data to the datbase ok 

        const result = await userData.create({
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

const logout = (req, res) => {
    try {
        res.clearCookie('token')
        return res.status(200).json({ success: true, message: 'Logged out successfully' });
        // need to here proper db to block that token paramently ok
    } catch (error) {
        res.status(400).json({
            success: false,
            msg: `error from registration ${error.message}`
        })
    }

}

const forgetPassword = (req, res) => {
    try {

    } catch (error) {

    }
}

const me = (req, res) => {
    res.status(200).json({
        success: true,
        msg: "login done "
    })
}


const UserDetails = async (req, res) => {
    try {
        const { username, name, role, location, website, github, linkedin } = req.body;
        const id = req.user;
        console.log(req.user)
        const CreateUserDetails = await userDetails.create({
            userId: id,
            username,
            name,
            role,
            location,
            website,
            github,
            linkedin
        })
        res.status(200).json({
            success: true,
            CreateUserDetails
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            msg: `error from registration ${error.message}`
        })
    }
}


const getUniqueUsername = async (req, res) => {

    try {
        const { username } = req.body
        console.log(username)
        const exits = await userDetails.findOne({ username })
        if (exits) {
            res.status(400).json({
                success: false,
                msg: `this user name is alredy register `
            })
        }
        res.status(200).json({
            success: true,
            msg: `you can use this username`
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            msg: `error from registration ${error.message}`
        })
    }

}


const userStats = async (req, res) => {
    try {
        // const username

        const data = await userDetails.findById(id)
        if (!data) {
            return res.status(false).json({
                success: false,
                msg: "sorry not data found "
            })
        }
        return res.status(200).json({
            success: true,
            msg: data
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            msg: `error from registration ${error.message}`
        })
    }

}

const SolvedMap = async (req, res) => {
    try {

        const data = await solvedmap.create(req.body)
        // if (!data) {
        //     res.status(false).json({
        //         success: false,
        //         msg: "sorry not data found "
        //     })
        // }

        res.status(200).json({
            success: true,
            msg: data
        })

    } catch (error) {
        console.log(error.message)
        res.status(400).json({
            success: false,
            msg: `error from registration ${error.message}`
        })
    }

}

module.exports = { login, registration, logout, forgetPassword, me, UserDetails, getUniqueUsername, userStats, SolvedMap }