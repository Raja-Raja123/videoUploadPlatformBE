import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, login, logout, refreshAccesssToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImg } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

  
 const userRouter = Router()
 
userRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)


userRouter.route("/login").post(login)

// secure routes
userRouter.route("/logout").post(verifyJWT,logout)
userRouter.route("/refresh-token").post(refreshAccesssToken)
userRouter.route("/change-password").post(verifyJWT,changeCurrentPassword)
userRouter.route("/current-user").get(verifyJWT,getCurrentUser)
userRouter.route("/update-user").patch(verifyJWT,updateAccountDetails)

userRouter.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
userRouter.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImg)

userRouter.route("/channel/:username").get(verifyJWT,getUserChannelProfile)
userRouter.route("/history/:username").get(verifyJWT,getWatchHistory)



export default userRouter;