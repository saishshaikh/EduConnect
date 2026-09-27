import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const signUp = async (req, res) => {
    try {
        const { firstName, lastName, userName, email, password } = req.body

        if (!firstName || !lastName || !userName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" })
        }

        const existEmail = await User.findOne({ email })
        if (existEmail) {
            return res.status(400).json({ message: "Email already exists!" })
        }

        const existUsername = await User.findOne({ userName })
        if (existUsername) {
            return res.status(400).json({ message: "Username already exists!" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            firstName,
            lastName,
            userName,
            email,
            password: hashedPassword
        })

        const token = genToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "none",
            secure: true
        })

        const userWithoutPassword = await User.findById(user._id).select("-password")
        return res.status(201).json({ ...userWithoutPassword.toObject(), token })

    } catch (error) {
        console.log("Signup error:", error)
        return res.status(500).json({ message: "Signup error" })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist!" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" })
        }

        const token = genToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "none",
            secure: true
        })

        const userWithoutPassword = await User.findById(user._id).select("-password")
        return res.status(200).json({ ...userWithoutPassword.toObject(), token })

    } catch (error) {
        console.log("Login error:", error)
        return res.status(500).json({ message: "Login error" })
    }
}

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        console.log("Logout error:", error)
        return res.status(500).json({ message: "Logout error" })
    }
}