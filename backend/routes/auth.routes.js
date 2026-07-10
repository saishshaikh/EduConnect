import express from "express"
import multer from "multer"
import { login, logOut, signUp } from "../controllers/auth.controllers.js"

const authRouter = express.Router()
const upload = multer()

authRouter.post("/signup", upload.single("profilePic"), signUp)
authRouter.post("/login", login)
authRouter.get("/logout", logOut)

export default authRouter