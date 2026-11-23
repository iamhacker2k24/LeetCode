const createAdmin = () => {
    try {
        const { name, email, password } = req.body
        if (name == "" || email == "" || password == "") {
            res.status(200).json({
                success: true,
                msg: "pls add all info first "
            })
        }

        //

        //
        res.status(200).json({
            success: true,

        })

    } catch (error) {
        res.status(200).json({
            success: true,
            msg: `error from createAdmin ${error.messsage}`
        })
    }


}


const dismissAdmin = () => {
    try {
        const { name, email, password } = req.body
        if (name == "" || email == "" || password == "") {
            res.status(200).json({
                success: true,
                msg: "pls add all info first "
            })
        }

        //

        //
        res.status(200).json({
            success: true,

        })

    } catch (error) {
        res.status(200).json({
            success: true,
            msg: `error from createAdmin ${error.messsage}`
        })
    }


}


module.exports = { createAdmin, dismissAdmin }