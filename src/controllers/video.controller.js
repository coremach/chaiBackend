import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "./../models/video.model.js"



const getAllVideos = asyncHandler(async (req, res, next) => {

    // Todo : write checks for query, userid , fetch from mongodb

    try {
        // take query from user
        const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc',userId } = req.query;

        // convert page and limit value from string to integer
        const pageNumber = parseInt(page, 10)
        const limitNumber = parseInt(limit, 10)

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
        // buold the sort object
        const sort = {}
        sort[sortBy] = sortType === 'asc' ? 1 : -1;

        // Fetch videos with pagination, filtering and sorting
        const allVideo = await Video.find(filter)
            .sort(sort)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)

        // Get total count of videos for pagination
        const totalVideos = await Video.countDocuments(filter);

        const vid_name = allVideo.map((video) => [video.title, video._id])
        // console.log(vid_name, page, pageNumber, filter, totalVideos);

        return res.status(200).json(new ApiResponse(200, vid_name, "get All videos successfull"))
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
            return next(new ApiError(401, "video file is required, cause error during uploading to cloudinary"))
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

        console.log(video);
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

        const vidExist = await Video.findById(req.params.videoId)
        console.log(req.params.videoId, vidExist, req.user?._id);

        if (!vidExist) {
            return next(new ApiError(401, "Video is not in database"))
        }

        // const vid = await Video.findByIdAndDelete(req.params.VideoId)
        // if (!vid) {
        //     return next(new ApiError(401, "Something went wrong while deleting video from mongoDB"))
        // }
        return res
            .status(200)
            .json(
                new ApiResponse(200, vidExist, "video Deleted successfully")
            )
    } catch (error) {
        return next(error)
    }
})

const getVideoById = asyncHandler(async (req, res, next) => {
    try {
        const videoId = req.params.videoId
        const getVideo = await Video.findById(videoId)
        console.log(getVideo, req.params.videoId);

        if (!getVideo) return next(new ApiError(401, "Videos not found in mongoDB"))

        return res
            .status(200)
            .json(
                new ApiResponse(200, getVideo, "Get all Videos by id successfully")
            )
    } catch (error) {
        return next(error)
    }
})

const updateVideo = asyncHandler(async (req, res, next) => {
    try {
        const videoId = req.params.videoId;
        const { title, description } = req.body;
        if (
            [title, description].some((fields) => [undefined, "", null].includes(fields?.trim()))
        ) return next(new ApiError(401, "All fields title and desciption are required"))


        console.log(title, description, req.file);
        const updateThumbnailpath = req.file?.path
        if (!updateThumbnailpath) return next(new ApiError(401, "new thumbnail local file is empty!"))


        // upload new thumbnail to cloudinary 
        const thumbnailPath = await uploadOnCloudinary(updateThumbnailpath)
        if (!thumbnailPath) {
            return next(new ApiError(401, "thumbnail file is required, cause error during uploading to cloudinary"))
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
            return next(new ApiError(401, "Something went wrong during updating in mongoDB"))
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
        if (!videoId) {
            return next(new ApiError(401, "videoId not found!!"))
        }
        // check video exist or not
        const video = await Video.findById(videoId)
        if (!video)
            return next(new ApiError(401, "Something went wrong during finding video in mongoDB"))

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
            return next(new ApiError(401, "Something went wrong during updating isPublish field in mongoDB"))
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