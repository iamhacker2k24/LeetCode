const createAdmin = () => {
    try {
        const { name, email, password } = req.body
        if (name == "" || email == "" || password == "") {
            res.status(200).json({
                sucess: true,
                msg: "pls add all info first "
            })
        }

        //

        //
        res.status(200).json({
            sucess: true,

        })

    } catch (error) {
        res.status(200).json({
            sucess: true,
            msg: `error from createAdmin ${error.messsage}`
        })
    }


}


const dismissAdmin = () => {
    try {
        const { name, email, password } = req.body
        if (name == "" || email == "" || password == "") {
            res.status(200).json({
                sucess: true,
                msg: "pls add all info first "
            })
        }

        //

        //
        res.status(200).json({
            sucess: true,

        })

    } catch (error) {
        res.status(200).json({
            sucess: true,
            msg: `error from createAdmin ${error.messsage}`
        })
    }


}


module.exports = { createAdmin, dismissAdmin }