import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const createTweet = asyncHandler(async (req, res, next) => {
    try {
        // Retrieves content from the request body and checks if it's empty.
        const { content } = req.body;
        if (!(content || content === "")) {
            return next(new ApiError(400, "Content is empty.."));
        }

        // Creates a new tweet with the provided content and the owner's ID.
        const tweet = await Tweet.create({
            content: content,
            owner: req.user?._id
        });

        // Checks if the tweet creation was unsuccessful; returns an error if it was.
        if (!tweet) {
            return next(new ApiError(500, "Something went wrong while creating tweet"));
        }

        // Returns a success response with the newly created tweet.
        return res.status(200).json(new ApiResponse(200, tweet, "Tweet Created Successfully"));

    } catch (error) {
        return next(error)
    }
})

const updateTweet = asyncHandler(async (req, res, next) => {
    try {
        // Retrieves new content from the request body and checks if it's empty.
        const newContent = req.body.content;
        if (!(newContent || newContent === "")) {
            return next(new ApiError(400, "New Content is empty.."));
        }

        // Retrieves the tweet ID from the request parameters and validates it.
        const tweetId = req.params.tweetId;
        if (!mongoose.Types.ObjectId.isValid(tweetId)) {
            return next(new ApiError(500, "Invalid Tweet id"));
        }

        // Checks if the tweet exists in the MongoDB collection.
        const tweetExist = await Tweet.findById(tweetId);
        if (!tweetExist) {
            return next(new ApiError(500, "Tweet doesn't exist"));
        }

        // Updates the content of the tweet in the MongoDB collection.
        const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,
            { $set: { content: newContent } },
            { new: true }
        );
        // Checks if the tweet update was unsuccessful; returns an error if it was.
        if (!updatedTweet) {
            return next(new ApiError(500, "Something went wrong while updating tweet on MongoDB"));
        }

        // Returns a success response with the updated tweet.
        return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet Updated Successfully"));

    } catch (error) {
        return next(error)
    }
})

const deleteTweet = asyncHandler(async (req, res, next) => {
    try {
        // Retrieves the tweet ID from the request parameters.
        const tweetId = req.params.tweetId;
        // Validates the tweet ID format; returns an error if it's invalid.
        if (!mongoose.Types.ObjectId.isValid(tweetId)) {
            return next(new ApiError(400, "Invalid tweet id"))
        }

        // Checks if the tweet exists by its ID.
        const tweetExist = await Tweet.findById(tweetId)
        // If not found, returns an error indicating the tweet doesn't exist.
        if (!tweetExist) {
            return next(new ApiError(500, "Tweet doesn't exist in MongoDB"))
        }

        // Deletes a tweet by its ID.
        const deleteTweet = await Tweet.deleteOne(new mongoose.Types.ObjectId(tweetId));
        // Returns an error if the fetch fails.
        if (!deleteTweet) {
            return next(new ApiError(500, "Something went wrong while deleting tweet from collection in mongoDB"))
        }
        return res.status(200).json(new ApiResponse(200, deleteTweet, "Tweet Deleted Successfully"))
    } catch (error) {
        return next(error)
    }
})
const getUserTweet = asyncHandler(async (req, res, next) => {
    try {
        // Retrieves the user ID from the request parameters.
        const userId = req.params.userId;
        // Validates the user ID format; returns an error if it's invalid.
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next(new ApiError(400, "Invalid User Id"))
        }

        // Extracts pagination parameters (page and limit) from the query string,
        // Defaults to page 1 and limit 10 if not provided.
        const { page = 1, limit = 10 } = req.query
        // Constructs an options object for pagination.
        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        }

        // Fetches tweets for a specific user and paginates the results. 
        const aggregate = Tweet.aggregate({ $match: { owner: userId } })
        const getUserTweet = await Tweet.aggregatePaginate(aggregate, options)

        // Returns an error if the fetch fails.
        if (!getUserTweet) {
            return next(new ApiError(500, "Something went wrong while fetching all tweet from Tweet Collection"))
        }
        return res.status(200).json(new ApiResponse(200, getUserTweet.docs, "Tweet from User fetched Successfully"))
    } catch (error) {
        return next(error)
    }
})

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweet,
}
asyncHandler, ApiError, ApiResponse, Tweet, mongoose