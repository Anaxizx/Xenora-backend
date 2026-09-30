const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Verifies the JWT (from httpOnly cookie or Authorization header),
 * loads the user, and attaches it to req.user.
 * Blocks the request with 401 if the token is missing/invalid.
 */
async function protect(req, res, next) {
    try {
        let token;

        // Prefer httpOnly cookie; fall back to Authorization header for API clients
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, please log in"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account not found or deactivated"
            });
        }

        req.user = user;
        next();

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Session expired or invalid, please log in again"
        });
    }
}

/**
 * Restricts route to admin-role users only.
 * Must be used AFTER protect().
 */
function adminOnly(req, res, next) {
    if (req.user && req.user.role === "admin") {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Admin access required"
    });
}

module.exports = { protect, adminOnly };
