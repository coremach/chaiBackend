import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from './../models/comment.model.js'
import { ApiError } from "../utils/ApiError.js";


const addComment = asyncHandler(async (req, res, next) => {
    try {
        const { content } = req.body;
        const videoId = req.params.videoId;
        console.log(videoId, content);

        const comment = await Comment.create({
            content: content,
            video: videoId,
            owner: req.user?._id,
        })
        if (!comment) {
            return next(new ApiError(500, "Something went wrong during entry of comment in mongoDB"))
        }
        return res.status(200).json(new ApiResponse(200, comment, "comment added successfully!!"))
    } catch (error) {
        return next(error)
    }
})

const deleteComment = asyncHandler(async (req, res, next) => {
    try {
        const commentId = req.params?.commentId;

        const del_comment = await Comment.findByIdAndDelete(commentId)
        if (!del_comment) {
            return next(new ApiError(500, "Something went wrong during deleting comment in mongoDB"))
        }
        console.log(req.params, del_comment);

        return res.status(200).json(new ApiResponse(200, del_comment, "comment deleted successfully!!"))
    } catch (error) {
        return next(error)
    }
})

const updateComment = asyncHandler(async (req, res, next) => {
    try {
        const commentId = req.params.commentId;
        const updatedContent = req.body.content.trim();
        if(!updatedContent)
            return next(new ApiError(401,"Content for update is empty"))
        console.log(commentId,updatedContent);
        
        const updatedComment = await Comment.findByIdAndUpdate(commentId,
            {
                content: updatedContent,
            },
            { new: true }
        )
        if (!updatedComment)
            return next(new ApiError(500, "Something went wrong during updating comment in mongoDB"))
        // console.log(req.params,updatedComment);

        return res.status(200).json(new ApiResponse(200, updatedComment, "comment updated successfully!!"))
    } catch (error) {
        return next(error)
    }
})

const getVideoComments = asyncHandler(async (req, res, next) => {
    try {
        const { videoId } = req.params;
        const { page = 1, limit = 10 } = req.query;
      
        // convert page string to integer
        const pageNumber = parseInt(page, 10)
        const limitNumber = parseInt(limit, 10)

        // fetch all comment from Comment model mongoDb
        const allComment = await Comment.find({ video:videoId })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
        if(!allComment)
            return next(new ApiError(500,"something went wrong while fetching all comments from mongoDB"))
        
        
        // console.log(videoId, pageNumber, limitNumber, allComment);
        return res.status(200).json(new ApiResponse(200, allComment, "Got all video comments Successfull"))
    } catch (error) {
        return next(error)
    }
})

export {
    addComment,
    updateComment,
    deleteComment,
    getVideoComments,
}