const User = require("../models/User");
const generateToken = require("../config/generateToken");

/* Cookie options - httpOnly so JS can't read it (protects against XSS token theft) */
function getCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in prod
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
}

/* ==========================================
   POST /api/auth/signup
========================================== */
async function signup(req, res) {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        const user = await User.create({ name, email, phone, password });

        const token = generateToken(user._id);

        res.cookie("token", token, getCookieOptions());

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: user.toSafeObject(),
            token // also returned in body for mobile/API clients that can't use cookies
        });

    } catch (err) {
        console.error("Signup error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating your account"
        });
    }
}

/* ==========================================
   POST /api/auth/login
========================================== */
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // .select("+password") needed since schema excludes it by default
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "This account has been deactivated"
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user._id);

        res.cookie("token", token, getCookieOptions());

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: user.toSafeObject(),
            token
        });

    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while logging in"
        });
    }
}

/* ==========================================
   POST /api/auth/logout
========================================== */
function logout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}

/* ==========================================
   GET /api/auth/me  (requires auth)
========================================== */
function getMe(req, res) {
    return res.status(200).json({
        success: true,
        user: req.user.toSafeObject()
    });
}

module.exports = { signup, login, logout, getMe };
