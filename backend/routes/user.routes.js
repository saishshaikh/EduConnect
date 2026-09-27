import express from "express"
import { getCurrentUser, getprofile, getSuggestedUser, search, updateProfile } from "../controllers/user.controllers.js"
import { isAuth, optionalAuth } from "../middlewares/isAuth.js"
import upload from "../middlewares/multer.js"

let userRouter=express.Router()

userRouter.get("/currentuser",isAuth,getCurrentUser)
userRouter.put("/updateprofile",isAuth,upload.fields([
   {name:"profileImage",maxCount:1} ,
   {name:"coverImage",maxCount:1}
]),updateProfile)
userRouter.get("/profile/:userName",optionalAuth,getprofile)
userRouter.get("/search",optionalAuth,search)
userRouter.get("/suggestedusers",optionalAuth,getSuggestedUser)
export default userRouter