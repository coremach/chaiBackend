import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Like } from './../models/like.model.js';
import { Comment } from './../models/comment.model.js';
import { Video } from './../models/video.model.js';
import { Tweet } from './../models/tweet.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';


const toggleVideoLike = asyncHandler(async (req, res, next) => {
    try {
        // Get Video Id 
        const { videoId } = req.params;

        // check Id is valid or not
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return next(new ApiError(400, "Invalid Video ID!!!"))
        }

        // Check Video document is exist in mongoDB Collection or not
        const isValidVideoId = await Video.findById(videoId)
        if (!isValidVideoId) {
            return next(new ApiError(500, "Something went wrong while checking Video id in mongoDB or Video doen't exist in mongoDB"))
        }

        // Check Video already liked or not
        const isVideoLiked = await Like.findOne({ video: videoId })
        if (!isVideoLiked) {

            // Insert Video id in Like Collection to like a Video
            const videoLike = await Like.create({ video: videoId, likedBy: req.user?._id })
            if (!videoLike) {
                return next(new ApiError(500, "Something went wrong while liking on video"))
            }
            return res.status(200).json(new ApiResponse(200, videoLike, "Like on video done successfully"))
        }

        // Delete a like on Video if already liked by removing Video id 
        // Or whole document from Like Collection.. 
        const deleteLike = await Like.deleteOne({ video: videoId, likedBy: req.user?._id })
        if (!deleteLike) {
            return next(new ApiError(500, "Something went wrong while deleting like on video"))
        }
        return res.status(200).json(new ApiResponse(200, deleteLike, "like on video deleted successfully!"))

    } catch (error) {
        return next(error)
    }
})

const toggleCommentLike = asyncHandler(async (req, res, next) => {
    try {
        // Get Comment Id 
        const { commentId } = req.params;

        // check Comment Id is valid or not
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return next(new ApiError(400, "Invalid Comment ID!!!"))
        }

        // Check Comment document is exist in mongoDB Collection or not
        const isValidCommentId = await Comment.findById(commentId)
        if (!isValidCommentId) {
            return next(new ApiError(500, "Something went wrong while checking comment id in mongoDB Or Comment doen't exist in monogDB"))
        }

        // Check Comment already liked or not
        const isCommentLiked = await Like.findOne({ comment: commentId })
        if (!isCommentLiked) {

            // Insert Comment id in Like Collection to like a Comment
            const commentLike = await Like.create({ comment: commentId, likedBy: req.user?._id })
            if (!commentLike) {
                return next(new ApiError(500, "Something went wrong while liking comment"))
            }
            return res.status(200).json(new ApiResponse(200, commentLike, "like on comment done successfully!"))
        }

        // Delete a like on Comment if already liked by removing Comment id 
        // Or whole document from Like Collection.. 
        const deleteLke = await Like.deleteOne({ comment: commentId, likedBy: req.user?._id })
        if (!deleteLke) {
            return next(new ApiError(500, "Something went wrong while deleting like on comment"))
        }
        return res.status(200).json(new ApiResponse(200, deleteLke, "like on comment deleted successfully!"))


    } catch (error) {
        return next(error)
    }
})

const toggleTweetLike = asyncHandler(async (req, res, next) => {
    try {
        // Get Tweet Id 
        const { tweetId } = req.params;

        // check Id is valid or not
        if (!mongoose.Types.ObjectId.isValid(tweetId)) {
            return next(new ApiError(400, "Invalid tweet ID"))
        }

        // Check Tweet document is exist in mongoDB Collection or not
        const isValidTweetID = await Tweet.findById(tweetId)
        if (!isValidTweetID) {
            return next(new ApiError(500, "Tweet doen't exist in mongoDb"))
        }
        // Check Tweet already liked or not
        const isTweetLiked = await Like.findOne({ $tweet: tweetId })
        if (!isTweetLiked) {
            // Insert Tweet id in Like Collection to like a Tweet
            const tweetLike = await Like.create({ tweet: tweetId, likedBy: req.user?._id })

            if (!tweetLike) {
                return next(new ApiError(500, "Something went wrong while liking on tweet"))
            }
            return res.status(200).json(new ApiResponse(200, tweetLike, "like on tweet done successfully!"))
        }

        // Delete a like on Tweet if already liked by removing Tweet id 
        // Or whole document from Like Collection.. 
        const deleteLIke = await Like.deleteOne({ tweet: tweetId, likedBy: req.user?._id })
        if (!deleteLIke) {
            return next(new ApiError(500, "Something went wrong while deleting like on tweet"))
        }
        return res.status(200).json(new ApiResponse(200, deleteLIke, "like on tweet done successfully!"))
    } catch (error) {
        return next(error)
    }
})

const getLikedVideos = asyncHandler(async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
        }

        const likedVideos = Like.aggregate([
            { $match: { likedBy: new mongoose.Types.ObjectId(req.user?._id) } },
        ])

        // const allLikes = await Like.aggregatePaginate(aggregate, options)
        const response = await Like.aggregatePaginate(likedVideos, options)
        // console.log("ok", likedVideos, response);
        if (!response) {
            return next(new ApiError(500, "Something went wrong while fetching all liked videos"))
        }
        return res.status(200).json(new ApiResponse(200, response.docs, "Got all liked video successfully!"))
    } catch (error) {
        return next(error)
    }
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
}