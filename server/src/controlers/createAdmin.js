const userData = require("../model/userData")

const createAdmin = async (req, res) => {
    try {
        const { email } = req.body;

        //fisrt need ot find ethe user then make them admin ok 
        const update = await userData.findOneAndUpdate({ email }, { role: "admin" })
        if (!update) {
            res.status(404).json({
                success: false,
                msg: " user not  found "

            })
        }

        res.status(200).json({
            success: true,
            msg: "yes you maked him properly admin"

        })


    } catch (error) {
        res.status(200).json({
            success: true,
            msg: `error from createAdmin ${error.messsage}`
        })
    }


}


const dismissAdmin = async (req, res) => {
    try {

        const { email } = req.body;

        //fisrt need ot find ethe user then make them admin ok 

        const update = await userData.findOneAndUpdate({ email }, { role: "user" })
        if (!update) {
            res.status(400).json({
                success: false,
                msg: "sorry no user found "

            })
        }

        res.status(200).json({
            success: true,
            msg: "you dissmiss as admin ok "

        })


    } catch (error) {
        res.status(200).json({
            success: true,
            msg: `error from createAdmin ${error.messsage}`
        })
    }


}


module.exports = { createAdmin, dismissAdmin }