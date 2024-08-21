import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import upload from '../middlewares/multer.middleware.js'
const router = Router()


router.route("/register").post(
    upload.fields([
        {name:"coverImage",maxCount:1},
        {name:"avatar",maxCount:1},
    ]),
    registerUser
)
router.route("/files").post(
    upload.fields([
        {name:"coverImage",maxCount:1},
        {name:"avatar",maxCount:1},
    ]),
    (req,res)=>{
        console.log("data from react app : ",req.body);
        console.log("data from react app : ",req.files?.avatar[0]?.path);
        console.log("data from react app : ",req.files?.coverImage[0]?.path);
        
    }
)

// router.route("/login").post(login)

export default router;