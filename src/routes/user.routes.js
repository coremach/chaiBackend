import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/user.controller.js';
import upload from '../middlewares/multer.middleware.js'
const router = Router()


router.route("/register").post(
    upload.fields([
        {name:"coverImage",maxCount:1},
        {name:"avatar",maxCount:1},
    ]),
    registerUser
)
router.route("/login").post(
    //  (req,res) =>{ 
    //     console.log(req.body);
    //     res.status(200).json({
    //     data: req.body,
    //     message:"credential received successfully"
    // })} ,
    loginUser
)
router.route("/files").post(
    (req,res)=>{
        console.log("data from react app : ",req.body);
        res.json({
            message:"received",
            data:req.body
        })
    }
)

// router.route("/login").post(login)

export default router;