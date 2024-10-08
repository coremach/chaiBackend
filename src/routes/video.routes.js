import { Router } from "express";
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";


const router = Router()
// router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file


router.route("/").get(verifyJWT, getAllVideos)
router.route("/").post(verifyJWT, 
    upload.fields([
        {name:"videoFile",maxCount:1},
        {name: "thumbnail",maxCount:1},
    ]),
    publishAVideo)
router.route("/:videoId").patch(verifyJWT,upload.single("thumbnail"),updateVideo)
router.route("/:videoId").delete(verifyJWT,deleteVideo)
router.route("/:videoId").get(verifyJWT,getVideoById)
router.route("/toggle/publish/:videoId").patch(verifyJWT,togglePublishStatus)

export default router
