import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../models/user.model.js"

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Get current user error" })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, userName, headline, location, gender } = req.body
        const skills = req.body.skills ? JSON.parse(req.body.skills) : []
        const education = req.body.education ? JSON.parse(req.body.education) : []
        const experience = req.body.experience ? JSON.parse(req.body.experience) : []

        let profileImage
        let coverImage

        if (req.files?.profileImage) {
            profileImage = await uploadOnCloudinary(req.files.profileImage[0].path)
        }
        if (req.files?.coverImage) {
            coverImage = await uploadOnCloudinary(req.files.coverImage[0].path)
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { firstName, lastName, userName, headline, location, gender, skills, education, experience, profileImage, coverImage },
            { new: true }
        ).select("-password")

        return res.status(200).json(user)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `Update profile error: ${error}` })
    }
}

export const getprofile = async (req, res) => {
    try {
        const { userName } = req.params
        if (!userName) {
            return res.status(400).json({ message: "Username or ID is required" })
        }

        const isObjectId = /^[0-9a-fA-F]{24}$/.test(userName.trim())
        const user = await User.findOne({
            $or: [
                { userName: { $regex: new RegExp(`^${userName.trim()}$`, "i") } },
                ...(isObjectId ? [{ _id: userName.trim() }] : [])
            ]
        }).select("-password")

        if (!user) {
            return res.status(404).json({ message: "Username does not exist" })
        }
        return res.status(200).json(user)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `Get profile error: ${error}` })
    }
}

export const search = async (req, res) => {
    try {
        const { query } = req.query
        if (!query || !query.trim()) {
            return res.status(200).json([])
        }

        const cleanQuery = query.trim()
        const users = await User.find({
            $or: [
                { firstName: { $regex: cleanQuery, $options: "i" } },
                { lastName: { $regex: cleanQuery, $options: "i" } },
                { userName: { $regex: cleanQuery, $options: "i" } },
                { skills: { $regex: cleanQuery, $options: "i" } }
            ]
        }).select("-password").limit(20)

        return res.status(200).json(users)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `Search error: ${error}` })
    }
}

export const getSuggestedUser = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId).select("connection")

        const suggestedUsers = await User.find({
            _id: {
                $ne: currentUser._id,  // ✅ Fixed
                $nin: currentUser.connection
            }
        }).select("-password")

        return res.status(200).json(suggestedUsers)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `Suggested user error: ${error}` })
    }
}