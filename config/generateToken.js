const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT for a given user id.
 * Token is stored client-side as an httpOnly cookie (safer than localStorage
 * against XSS) — see authController for how it's set.
 */
function generateToken(userId) {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

module.exports = generateToken;
