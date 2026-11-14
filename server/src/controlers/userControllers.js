const login = (req, res) => {
    try {
        const { email, password } = req.body
        if (email == "" || password == "") {
            res.status(200).json({
                sucess: true,
                msg: "pls fill all info "
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
            msg: `error from login ${error.messsage}`
        })
    }

}
const registration = () => {
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
            msg: `error from registration ${error.messsage}`
        })
    }

}

module.exports = { login, registration }