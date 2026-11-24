const roleHierarchy = {
    user: 1,
    admin: 2,
    owner: 3
};

const CheckRole = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.role;

        if (!userRole) {
            return res.status(401).json({
                success: false,
                msg: "Unauthorized: No role found in request"
            });
        }

        //Direct match (e.g. CheckRole("admin", "owner"))
        if (allowedRoles.includes(userRole)) {
            return next();
        }

        //Hierarchy match: If "user" is required, admins and owners are automatically allowed
        if (allowedRoles.includes("user") && (userRole === "admin" || userRole === "owner")) {
            return next();
        }

        // If "admin" is required, owner is automatically allowed
        if (allowedRoles.includes("admin") && userRole === "owner") {
            return next();
        }

        return res.status(403).json({
            success: false,
            msg: `Access denied. Requires one of: [${allowedRoles.join(", ")}], but your role is '${userRole}'`
        });
    };
};

module.exports = { CheckRole };