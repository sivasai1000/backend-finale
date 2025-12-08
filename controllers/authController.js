const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        let { name, email, mobile, password } = req.body;
        if (!name || !password || (!email && !mobile)) {
            return res.status(400).json({
                status: "failed",
                message: "name, password, and either email or mobile are required",
            });
        }

        // Check if user exists
        const [existing] = await pool.query(
            "SELECT * FROM Users WHERE email = ? OR mobile = ?",
            [email || null, mobile || null]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                status: "failed",
                message: "Email or mobile already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            "INSERT INTO Users (name, email, mobile, password, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'user', 1, NOW(), NOW())",
            [name, email || null, mobile || null, hashedPassword]
        );

        const user = {
            id: result.insertId,
            name,
            email: email || null,
            mobile: mobile || null,
            role: 'user'
        };

        // Create Token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                return res.status(200).json({
                    status: "success",
                    message: "Registered successfully",
                    token,
                    user
                });
            }
        );

    } catch (e) {
        console.error("Register error:", e.message);
        return res.status(500).json({
            status: "failed",
            message: "Something went wrong during registration",
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, mobile, password } = req.body;

        if ((!email && !mobile) || !password) {
            return res.status(400).json({
                status: "failed",
                message: "email or mobile and password are required",
            });
        }
        const [result] = await pool.query(
            "SELECT * FROM Users WHERE email = ? OR mobile = ?",
            [email || null, mobile || null]
        );

        if (result.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "User not found",
            });
        }

        const user = result[0];

        // Active check
        if (user.isActive === 0) {
            return res.status(403).json({
                status: "failed",
                message: "Your account is deactivated. Please contact admin.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                status: "failed",
                message: "Incorrect password",
            });
        }

        // Create Token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                return res.status(200).json({
                    status: "success",
                    message: "Login successful",
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        mobile: user.mobile,
                        role: user.role
                    },
                });
            }
        );

    } catch (e) {
        console.error("Login error:", e.message);
        return res.status(500).json({
            status: "failed",
            message: "Something went wrong during login",
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { email, mobile, password, newpassword } = req.body;

        if ((!email && !mobile) || !password || !newpassword) {
            return res.status(400).json({
                status: "failed",
                message: "email or mobile, current password, and new password are required",
            });
        }

        const [rows] = await pool.query(
            "SELECT * FROM Users WHERE email = ? OR mobile = ?",
            [email || null, mobile || null]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "User not found",
            });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                status: "failed",
                message: "Current password is incorrect",
            });
        }

        const newHashedPassword = await bcrypt.hash(newpassword, 10);
        await pool.query("UPDATE Users SET password = ? WHERE id = ?", [newHashedPassword, user.id]);

        return res.status(200).json({
            status: "success",
            message: "Password updated successfully",
        });

    } catch (e) {
        console.error("Change password error:", e.message);
        return res.status(500).json({
            status: "failed",
            message: "Something went wrong while changing password",
        });
    }
};

module.exports = { register, login, changePassword };
