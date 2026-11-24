

const CheckRole = (...roles) => {
    try {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    message: "Access denied"
                });
            }
        }
        next();
    }
    catch (error) {
        throw new Error(error.message)
    }
}

module.exports = { CheckRole }