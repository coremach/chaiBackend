import { Router } from 'express';
import 
{ 
    changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistroy, 
    loginUser, 
    logoutUser,
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage
} from '../controllers/user.controller.js';
import upload from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = Router()

// route for register new user
router.route("/register").post(
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "avatar", maxCount: 1 },
    ]),
    registerUser
)
// route for login
router.route("/login").post(loginUser)

// secured routes for logout
router.route("/logout").post(
    verifyJWT,  // middleware used here
    logoutUser
)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").post(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistroy)


// router for testing purpose
router.route("/files").post(
    (req, res) => {
        console.log("data from react app : ", req.body);
        res.json({
            message: "received",
            data: req.body
        })
    }
)



export default router;