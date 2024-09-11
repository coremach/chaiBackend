import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subsciption.model.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";




const getChannelStats = asyncHandler(async (req, res, next) => {
    try {
        // Create a new ObjectId from the user's ID
        const userId = new mongoose.Types.ObjectId(req.user?._id);

        // Aggregate video statistics based on the userId
        const vidStats = await Video.aggregate([
            { $match: { _id: userId } },
            {
                $group: {
                    _id: "$owner",
                    allVideos: { $push: "$_id" },
                    totalVideos: { $sum: 1 },
                    totalViews: { $sum: "$views" }
                }
            },
        ]);

        // Check if vidStats was found, return an error if not
        if (!vidStats) {
            return next(new ApiError(500, "Error finding channel"));
        }

        // Aggregate likes for the videos if any video statistics were found
        const allLikes = (vidStats.length !== 0) ? await Like.aggregate([
            { $match: { video: { $in: vidStats[0].allVideos } } },
            { $count: "allVideoLikes" },
        ]) : [];

        // Check if allLikes was found, return an error if not
        if (!allLikes) {
            return next(new ApiError(500, "Error finding AllLikes"));
        }

        // Aggregate subscriber count for the channel
        const subscriber = await Subscription.aggregate([
            { $match: { channel: userId } },
            { $count: "subscriberCount" },
        ]);

        // Check if subscriber count was found, return an error if not
        if (!subscriber) {
            return next(new ApiError(500, "Error finding subscribers"));
        }

        // Prepare the response object with aggregated data
        const response = {
            allVideos: (vidStats.length !== 0) ? vidStats[0].allVideos : 0,
            totalVideos: (vidStats.length !== 0) ? vidStats[0].totalVideos : 0,
            totalViews: (vidStats.length !== 0) ? vidStats[0].totalViews : 0,
            allVideosLikes: (allLikes.length !== 0) ? allLikes[0].allVideoLikes : 0,
            totalSubcribers: (subscriber.length !== 0) ? subscriber[0].subscriberCount : 0,
        };

        // Return a success response with the prepared response object
        return res.status(200).json(new ApiResponse(200, response, "get Channel stats successfully"))
    } catch (error) {
        return next(error)
    }
})

const getChannelVideos = asyncHandler(async (req, res, next) => {
    // Fetching channel videos for the authenticated user
    try {
        // Get the user ID from the request object
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        // Extract pagination parameters from the query, defaulting to page 1 and limit 20
        const { page = 1, limit = 20 } = req.query;
        // Convert page and limit to interger
        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        // Create an aggregation query to fetch videos owned by the user
        const aggregate = Video.aggregate([
            { $match: { owner: userId } }
        ]);
        
        // Use aggregate pagination to get the channel videos
        const channelVideos = await Video.aggregatePaginate(aggregate, options);

        // Check if videos were fetched successfully
        if (!channelVideos) {
            return next(new ApiError(500, "Something went wrong while fetching videos from Video Collection"));
        }

        // Respond with the fetched videos and a success message
        return res.status(200).json(new ApiResponse(200, channelVideos.docs, "Fetched Channel Videos successfully"));
    } catch (error) {
        return next(error)
    }
})

export {
    getChannelStats,
    getChannelVideos,
}