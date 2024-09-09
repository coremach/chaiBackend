import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router()
// Apply verifyJWT to all routes in this file
router.use(verifyJWT)

router.route("/").post(createPlaylist)

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist)

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").delete(removeVideoFromPlaylist)

router.route("/user/:userId").get(getUserPlaylist)

export default router;
