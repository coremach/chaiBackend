import { Router } from 'express';
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js';
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
router.route("/login").post(
    // (req, res, next) => {
    //     console.log(req.body);
    //     req.user = req?.body
    //     // res.status(200).json({
    //     //     data: req.user,
    //     //     message: "credential received successfully"
    //     // })
    //     next()
    // },
    loginUser
)
// secured routes for logout
router.route("/logout").post(
    verifyJWT, 
    logoutUser)


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