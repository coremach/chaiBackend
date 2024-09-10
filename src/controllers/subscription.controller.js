import { asyncHandler } from './../utils/asyncHandler.js';
import { ApiResponse } from './../utils/ApiResponse.js';
import { ApiError } from './../utils/ApiError.js';
import { Subscription } from '../models/subsciption.model.js';
import mongoose from 'mongoose';


const toggleSubscription = asyncHandler(async (req, res, next) => {
    try {
        // Retrive channel Id from the parameter and return error if it's invalid
        const { channelId } = req.params
        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            return next(new ApiError(400, "Invalid Channel Id "))
        }
        // Restrict user to subscriber himselg
        if (channelId === req.user?._id) {
            return next(new ApiError(400, "User cannot subscriber his own channel"))
        }
        // Check user already subscriber a chennel or not
        const isSubscirbed = await Subscription.findOne({ channel: channelId, subscriber: req.user?._id })
        console.log(isSubscirbed);

        if (!isSubscirbed) {
            // Create a subscription for the user to the specified channel
            const toggleSub = await Subscription.create({
                subscriber: req.user?._id,
                channel: channelId,
            });
            // Check if the subscription was created successfully
            if (!toggleSub) {
                return next(new ApiError(500, "Something went wrong while toggling subs in Subscription Collection"));
            }
            // Return a success response with the toggle Sub
            return res.status(200).json(new ApiResponse(200, toggleSub, "Toggle subscription successfully"))
        }
        // Unsubscribe a channel on Subscription if already Subscribed by removing Channel id 
        // Or whole document from Like Collection.. 
        const unSubscribe = await Subscription.deleteOne({ channel: channelId, subscriber: req.user?._id })
        if (!unSubscribe) {
            return next(new ApiError(500, "Something went wrong while deleting or unSubsribing"))
        }
        console.log(unSubscribe);
        // Return a success resposnse with the unSubscribe acknowledge
        return res.status(200).json(new ApiResponse(200, unSubscribe, "UnSubscribe a channel successfully"))
    } catch (error) {
        return next(error)
    }
})
const getUserChannelSubscriber = asyncHandler(async (req, res, next) => {
    try {
        // Retrive channel Id from the parameter and return error if it's invalid
        const { subscriberId } = req.params
        if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
            return next(new ApiError(400, "Invalid Subscriber Id "))
        }

        // Fetch all subscriptions for the given subscriber ID
        const subscribers = await Subscription.find({ subscriber: subscriberId });

        // Check if the subscribers were retrieved successfully
        if (!subscribers) {
            return next(new ApiError(500, "Something went wrong while fetching Subscriber from Subscription Collection"));
        }

        // Return a success response with the subcriber
        return res.status(200).json(new ApiResponse(200, subscribers, "Fetch channel subcriber successfully"))
    } catch (error) {
        return next(error)
    }
})
const getSubscribedChannels = asyncHandler(async (req, res, next) => {
    try {
        // Retrive channel Id from the parameter and return error if it's invalid
        const { channelId } = req.params
        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            return next(new ApiError(400, "Invalid Channel Id "))
        }
        // Fetch all subscriptions for the given subscriber ID
        const subscribedChannel = await Subscription.find({ channel: channelId });

        // Check if the subscribers were retrieved successfully
        if (!subscribedChannel) {
            return next(new ApiError(500, "Something went wrong while fetching Subscribed channel from Subscription Collection"));
        }
        return res.status(200).json(new ApiResponse(200, subscribedChannel, "Fetched subscribed channel successfully"))
    } catch (error) {
        return next(error)
    }
})

export {
    toggleSubscription,
    getUserChannelSubscriber,
    getSubscribedChannels,
}