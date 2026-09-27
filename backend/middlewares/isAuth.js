import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export const isAuth = (req, res, next) => {
    try {
        const token =
            req.cookies?.token ||
            req.headers?.authorization?.replace("Bearer ", "") ||
            req.query?.token

        if (!token) {
            return res.status(401).json({ message: "Unauthorized, no token" })
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)
        if (!verifyToken) {
            return res.status(401).json({ message: "Unauthorized, invalid token" })
        }

        req.userId = verifyToken.userId
        next()

    } catch (error) {
        console.log("Auth middleware error:", error)
        return res.status(401).json({ message: "Unauthorized" })
    }
}

export const optionalAuth = (req, res, next) => {
    try {
        const token =
            req.cookies?.token ||
            req.headers?.authorization?.replace("Bearer ", "") ||
            req.query?.token

        if (token) {
            const verifyToken = jwt.verify(token, process.env.JWT_SECRET)
            if (verifyToken) {
                req.userId = verifyToken.userId
            }
        }
        next()
    } catch {
        next()
    }
}

export default isAuth