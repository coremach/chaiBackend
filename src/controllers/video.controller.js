import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "./../models/video.model.js"
import mongoose, { isValidObjectId } from "mongoose";



const getAllVideos = asyncHandler(async (req, res, next) => {
    try {
        // take query from user
        const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

        // Validate userId if provided
        if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, 'Invalid user ID');
        }

        // create filter object
        const filter = {}
        // filter by title
        if (query) {
            filter.title = { $regex: query, $options: 'i' }
        }
        // filter by userId
        if (userId) {
            filter.owner = userId
        }
        const aggregate = Video.aggregate([
            { $match: filter },
            { $sort: { [sortBy]: sortType === 'asc' ? 1 : -1 } },
        ])
        // build the option object
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
        }


        // Fetch videos with pagination, filtering and sorting
        const allVideo = await Video.aggregatePaginate(aggregate, options)
        if (!allVideo) {
            return next(new ApiError(500, "something went wrong during fetch all video from mongoDB"))
        }

        // console.log(allVideo.docs);

        return res.status(200).json(new ApiResponse(200, allVideo, "get All videos successfull"))
    } catch (error) {
        console.log({ code: error.statusCode, message: error.message });
        return next(error)
    }
})

const publishAVideo = asyncHandler(async (req, res, next) => {

    try {
        // get video details from frontend or user
        const { title, description } = req.body;
        // validation not empty
        if (
            [title, description].some((fields) => [undefined, "", null].includes(fields?.trim()))
        ) {
            return next(new ApiError(401, "Title and Description fields required"))
        }
        // check for video and thumbnail
        let videoLocalPath
        if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
            videoLocalPath = req.files.videoFile[0].path
        }
        let thumbnailLocalPath
        if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
            thumbnailLocalPath = req.files.thumbnail[0].path
        }
        // validation not empty if empty throw error
        if (!(thumbnailLocalPath && videoLocalPath)) {
            return next(new ApiError(400, "Video and thumbnail required"))
        }
        // upload file to cloudinary
        const upload_Video = await uploadOnCloudinary(videoLocalPath)
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (!upload_Video) {
            return next(new ApiError(500, "video file is required, cause error during uploading to cloudinary"))
        }
        const { url, duration } = upload_Video

        // create video object for mongoDB - create entry in DB
        const temp = {
            title: title,
            description,
            videoFile: url,
            thumbnail: thumbnail.url,
            duration,
            owner: req.user?._id
        }
        const video = await Video.create(temp)
        console.log({ title, description, videoLocalPath, thumbnailLocalPath, duration, url, thumbUrl: thumbnail.url });

        // console.log(video);
        if (!video) {
            return next(new ApiError(500, "Something went wrong during entry of video details in database"))
        }

        return res.status(200).json(new ApiResponse(200, video, "get All videos successfull"))
    } catch (error) {
        // console.log({ code: error.code, message: error.message, error });
        return next(error);
    }
})

const deleteVideo = asyncHandler(async (req, res, next) => {
    try {
        // console.log(req.params.videoId, vidExist, req.user?._id);
        if (!mongoose.Types.ObjectId.isValid(req.params.videoId)) {
            return next(new ApiError(400, "Invalid video ID"))
        }
        const isVidExist = await Video.findById(req.params.videoId)
        if (!isVidExist) {
            return next(new ApiError(500, "Video is not in database"))
        }

        const vid = await Video.findByIdAndDelete(req.params.VideoId)
        if (!vid) {
            return next(new ApiError(500, "Something went wrong while deleting video from mongoDB"))
        }
        return res
            .status(200)
            .json(new ApiResponse(200, vidExist, "video Deleted successfully"))
    } catch (error) {
        return next(error)
    }
})

const getVideoById = asyncHandler(async (req, res, next) => {
    try {
        const videoId = req.params.videoId
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return next(new ApiError(400, "Invalid video ID"))
        }
        const getVideo = await Video.findById(videoId)
        if (!getVideo) {
            return next(new ApiError(500, "Videos not found in mongoDB"))
        }
        // console.log(getVideo, req.params.videoId);
        return res
            .status(200)
            .json(new ApiResponse(200, getVideo, "Get all Videos by id successfully"))
    } catch (error) {
        return next(error)
    }
})

const updateVideo = asyncHandler(async (req, res, next) => {
    try {
        const videoId = req.params.videoId;
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return next(new ApiError(400, "Invalid video ID"))
        }
        const { title, description } = req.body;
        if (
            [title, description].some((fields) => [undefined, "", null].includes(fields?.trim()))
        ) return next(new ApiError(400, "All fields title and desciption are required"))


        // console.log(title, description, req.file);
        const updateThumbnailpath = req.file?.path;
        if (!updateThumbnailpath) {
            return next(new ApiError(401, "new thumbnail local file is empty!"))
        }

        // upload new thumbnail to cloudinary 
        const thumbnailPath = await uploadOnCloudinary(updateThumbnailpath)
        if (!thumbnailPath) {
            return next(new ApiError(500, "thumbnail file is required, cause error during uploading to cloudinary"))
        }
        // console.log(title, description, req.file.path, updateThumbnailpath, thumbnailPath.url);


        // update new video details to mongoDB
        const updatedVideo = await Video.findByIdAndUpdate(videoId,
            {
                $set: {
                    title, description,
                    thumbnail: thumbnailPath.url
                }
            },
            { new: true }
        )
        if (!updatedVideo) {
            return next(new ApiError(500, "Something went wrong during updating in mongoDB"))
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, updatedVideo, "Video details updated successfully")
            )
    } catch (error) {
        console.log(error.stack);

        return next(error)
    }
})

const togglePublishStatus = asyncHandler(async (req, res, next) => {
    try {
        const videoId = req.params.videoId;
        if (!videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
            return next(new ApiError(400, "videoId not found or Invalid video id!!"))
        }
        // check video exist or not
        const video = await Video.findById(videoId)
        if (!video) {
            return next(new ApiError(500, "Something went wrong during finding video in mongoDB"))
        }
        // build status variable and assign value true or false
        const status = video.isPublished === true ? false : true

        // updating isPublish field in mongoDB
        const Published = await Video.findByIdAndUpdate(videoId,
            {
                $set: {
                    isPublished: status
                }
            },
            { new: true }
        )
        if (!Published) {
            return next(new ApiError(500, "Something went wrong during updating isPublish field in mongoDB"))
        }

        return res.status(200).json(new ApiResponse(200, Published, "ispublished done successfully"))

    } catch (error) {
        console.log({ code: error.statusCode, message: error.message });
        return next(error)
    }
})
export {
    getAllVideos,
    publishAVideo,
    deleteVideo,
    getVideoById,
    updateVideo,
    togglePublishStatus,
}