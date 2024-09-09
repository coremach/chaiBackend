import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,  
} from "../controllers/comment.controller.js";

const router = Router()


// Apply verifyJWT middleware to all routes in this file
router.use(verifyJWT)  

router.route("/:videoId")
    .post(addComment)
    .get(getVideoComments)
router.route("/c/:commentId")
    .delete(deleteComment)
    .patch(updateComment)

export default router;