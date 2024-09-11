import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from './../models/comment.model.js'
import { ApiError } from "../utils/ApiError.js";


const addComment = asyncHandler(async (req, res, next) => {
    try {
        // Extract the content of the comment from the request body
        const { content } = req.body;

        // Get the videoId from the request parameters
        const videoId = req.params.videoId;

        // Create a new comment in the database with the provided content, associated video ID, and user ID
        const comment = await Comment.create({
            content: content,         // The content of the comment
            video: videoId,          // The associated video ID
            owner: req.user?._id,    // The ID of the user making the comment
        });

        // Check if the comment was created successfully
        if (!comment) {
            return next(new ApiError(500, "Something went wrong during entry of comment in MongoDB"));
        }

        // Return success response with the newly created comment
        return res.status(200).json(new ApiResponse(200, comment, "Comment added successfully!!"));

    } catch (error) {
        return next(error)
    }
})

const deleteComment = asyncHandler(async (req, res, next) => {
    try {
        // Get the commentId from the request parameters
        const commentId = req.params?.commentId;

        // Attempt to delete the comment from the database using the commentId
        const del_comment = await Comment.findByIdAndDelete(commentId);

        // Check if the deletion was successful
        if (!del_comment) {
            return next(new ApiError(500, "Something went wrong during deleting comment in MongoDB"));
        }

        // Return success response with the deleted comment details
        return res.status(200).json(new ApiResponse(200, del_comment, "Comment deleted successfully!!"));

    } catch (error) {
        return next(error)
    }
})

const updateComment = asyncHandler(async (req, res, next) => {
    try {
        // Get the commentId from the request parameters
        const commentId = req.params.commentId;

        // Extract and trim the updated content from the request body
        const updatedContent = req.body.content.trim();

        // Check if the updated content is empty
        if (!updatedContent) {
            return next(new ApiError(401, "Content for update is empty"));
        }

        // Attempt to update the comment in the database using the commentId
        const updatedComment = await Comment.findByIdAndUpdate(commentId,
            {
                content: updatedContent, // Set the new content for the comment
            },
            { new: true } // Return the updated document
        );

        // Check if the update was successful
        if (!updatedComment) {
            return next(new ApiError(500, "Something went wrong during updating comment in MongoDB"));
        }

        // Return success response with the updated comment details
        return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully!!"));

    } catch (error) {
        return next(error)
    }
})

const getVideoComments = asyncHandler(async (req, res, next) => {
    try {
        // Destructure videoId from the request parameters
        const { videoId } = req.params;

        // Destructure page and limit from the query parameters, with default values
        const { page = 1, limit = 10 } = req.query;

        // Convert page and limit strings to integers
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // Fetch all comments associated with the specified videoId from the Comment model in MongoDB
        const allComment = await Comment.find({ video: videoId })
            .skip((pageNumber - 1) * limitNumber) // Skip the appropriate number of comments for pagination
            .limit(limitNumber); // Limit the number of comments returned

        // Check if comments were fetched successfully
        if (!allComment) {
            return next(new ApiError(500, "Something went wrong while fetching all comments from MongoDB"));
        }

        // Return success response with the fetched comments
        return res.status(200).json(new ApiResponse(200, allComment, "Got all video comments successfully"));

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