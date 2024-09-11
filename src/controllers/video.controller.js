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
const rand_vid = [
    {
        "title": "The Thrill of the Drive",
        "description": "Experience the adrenaline rush of driving a BMW.",
        "videoFile": "http://example.com/video_1f5b8e4c3d9a4f78b2e1c6a8e7e4a3b9.mp4",
        "thumbnail": "http://example.com/image_2a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p.png",
        "duration": 4.5,
        "views": 120
    },
    {
        "title": "Racing into the Future",
        "description": "How BMW is leading the charge in electric racing.",
        "videoFile": "http://example.com/video_3b6c8d9e0f1a2b3c4d5e6f7g8h9i0j1k.mp4",
        "thumbnail": "http://example.com/image_4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r.png",
        "duration": 5.1,
        "views": 200
    },
    {
        "title": "Mastering the Track",
        "description": "Learn the secrets of racing from BMW's best drivers.",
        "videoFile": "http://example.com/video_5c7d8e9f0a1b2c3d4e5f6g7h8i9j0k1l.mp4",
        "thumbnail": "http://example.com/image_6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s.png",
        "duration": 6.0,
        "views": 150
    },
    {
        "title": "The Art of Performance",
        "description": "Discover what makes BMW performance unmatched.",
        "videoFile": "http://example.com/video_7d8e9f0a1b2c3d4e5f6g7h8i9j0k1l2m.mp4",
        "thumbnail": "http://example.com/image_8e9f0a1b2c3d4e5f6g7h8i9j0k1l2m3n.png",
        "duration": 4.8,
        "views": 180
    },
    {
        "title": "BMW: A Legacy of Innovation",
        "description": "Explore the innovative spirit of BMW through the years.",
        "videoFile": "http://example.com/video_9e0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o.mp4",
        "thumbnail": "http://example.com/image_0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p.png",
        "duration": 5.5,
        "views": 220
    },
    {
        "title": "Driving Dynamics Explained",
        "description": "Understanding the technology behind BMW's driving dynamics.",
        "videoFile": "http://example.com/video_1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q.mp4",
        "thumbnail": "http://example.com/image_1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q.png",
        "duration": 5.2,
        "views": 170
    },
    {
        "title": "The Future of Mobility",
        "description": "BMW's vision for sustainable and smart mobility.",
        "videoFile": "http://example.com/video_2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r.mp4",
        "thumbnail": "http://example.com/image_2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r.png",
        "duration": 6.5,
        "views": 250
    },
    {
        "title": "The BMW Experience",
        "description": "What it feels like to be behind the wheel of a BMW.",
        "videoFile": "http://example.com/video_3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s.mp4",
        "thumbnail": "http://example.com/image_3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s.png",
        "duration": 4.9,
        "views": 300
    },
    {
        "title": "Performance Meets Luxury",
        "description": "The perfect blend of performance and luxury in BMW.",
        "videoFile": "http://example.com/video_4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t.mp4",
        "thumbnail": "http://example.com/image_4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t.png",
        "duration": 5.8,
        "views": 320
    },
    {
        "title": "BMW's Racing Heritage",
        "description": "A look back at BMW's storied racing history.",
        "videoFile": "http://example.com/video_5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u.mp4",
        "thumbnail": "http://example.com/image_5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u.png",
        "duration": 6.1,
        "views": 280
    },
    {
        "title": "The Evolution of BMW Design",
        "description": "How BMW's design language has evolved over the years.",
        "videoFile": "http://example.com/video_6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v.mp4",
        "thumbnail": "http://example.com/image_6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v.png",
        "duration": 5.3,
        "views": 360
    },
    {
        "title": "BMW and the Environment",
        "description": "BMW's commitment to sustainability and eco-friendly practices.",
        "videoFile": "http://example.com/video_7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w.mp4",
        "thumbnail": "http://example.com/image_7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w.png",
        "duration": 4.7,
        "views": 400
    },
    {
        "title": "The BMW Community",
        "description": "Join the vibrant community of BMW enthusiasts.",
        "videoFile": "http://example.com/video_8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x.mp4",
        "thumbnail": "http://example.com/image_8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x.png",
        "duration": 5.6,
        "views": 450
    },
    {
        "title": "BMW Technology Showcase",
        "description": "The latest technologies that power BMW vehicles.",
        "videoFile": "http://example.com/video_9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y.mp4",
        "thumbnail": "http://example.com/image_9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y.png",
        "duration": 6.4,
        "views": 500
    },
    {
        "title": "BMW: The Ultimate Driving Machine",
        "description": "What makes BMW the ultimate driving machine?",
        "videoFile": "http://example.com/video_0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z.mp4",
        "thumbnail": "http://example.com/image_0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z.png",
        "duration": 5.0,
        "views": 550
    },
    {
        "title": "BMW's Commitment to Safety",
        "description": "How BMW prioritizes safety in their vehicles.",
        "videoFile": "http://example.com/video_1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a.mp4",
        "thumbnail": "http://example.com/image_1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a.png",
        "duration": 4.4,
        "views": 600
    },
    {
        "title": "Customizing Your BMW",
        "description": "Explore the options for customizing your BMW.",
        "videoFile": "http://example.com/video_2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b.mp4",
        "thumbnail": "http://example.com/image_2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b.png",
        "duration": 5.9,
        "views": 650
    },
    {
        "title": "The BMW M Series",
        "description": "An in-depth look at the BMW M performance series.",
        "videoFile": "http://example.com/video_3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c.mp4",
        "thumbnail": "http://example.com/image_3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c.png",
        "duration": 6.2,
        "views": 700
    },
    {
        "title": "BMW's Global Impact",
        "description": "How BMW is making a difference worldwide.",
        "videoFile": "http://example.com/video_4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d.mp4",
        "thumbnail": "http://example.com/image_4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d.png",
        "duration": 5.4,
        "views": 750
    },
    {
        "title": "The Luxury of BMW",
        "description": "What luxury means in the context of BMW.",
        "videoFile": "http://example.com/video_5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e.mp4",
        "thumbnail": "http://example.com/image_5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e.png",
        "duration": 6.7,
        "views": 800
    },
    {
        "title": "The Future of BMW",
        "description": "What lies ahead for BMW and its innovations.",
        "videoFile": "http://example.com/video_6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f.mp4",
        "thumbnail": "http://example.com/image_6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f.png",
        "duration": 5.6,
        "views": 850
    },
    {
        "title": "BMW's Iconic Models",
        "description": "A look at the most iconic BMW models throughout history.",
        "videoFile": "http://example.com/video_7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g.mp4",
        "thumbnail": "http://example.com/image_7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g.png",
        "duration": 4.9,
        "views": 900
    },
    {
        "title": "BMW: Beyond the Road",
        "description": "Exploring BMW's ventures beyond automotive.",
        "videoFile": "http://example.com/video_8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h.mp4",
        "thumbnail": "http://example.com/image_8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h.png",
        "duration": 6.1,
        "views": 950
    },
    {
        "title": "The BMW Lifestyle",
        "description": "What it means to live the BMW lifestyle.",
        "videoFile": "http://example.com/video_9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i.mp4",
        "thumbnail": "http://example.com/image_9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i.png",
        "duration": 5.3,
        "views": 1000
    },
    {
        "title": "BMW: A Global Brand",
        "description": "Understanding BMW's presence around the world.",
        "videoFile": "http://example.com/video_0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j.mp4",
        "thumbnail": "http://example.com/image_0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j.png",
        "duration": 6.4,
        "views": 1100
    },
    {
        "title": "The BMW Family",
        "description": "Meet the people behind the BMW brand.",
        "videoFile": "http://example.com/video_1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k.mp4",
        "thumbnail": "http://example.com/image_1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k.png",
        "duration": 5.0,
        "views": 1200
    },
    {
        "title": "BMW: The Road Ahead",
        "description": "What the future holds for BMW and its drivers.",
        "videoFile": "http://example.com/video_2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l.mp4",
        "thumbnail": "http://example.com/image_2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l.png",
        "duration": 6.0,
        "views": 1300
    },
    {
        "title": "The BMW Experience Center",
        "description": "Visit the BMW Experience Center for an immersive journey.",
        "videoFile": "http://example.com/video_3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m.mp4",
        "thumbnail": "http://example.com/image_3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m.png",
        "duration": 4.6,
        "views": 1400
    },
    {
        "title": "BMW's Innovative Designs",
        "description": "A showcase of BMW's most innovative designs.",
        "videoFile": "http://example.com/video_4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n.mp4",
        "thumbnail": "http://example.com/image_4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n.png",
        "duration": 5.8,
        "views": 1500
    }
]


const publishAVideo = asyncHandler(async (req, res, next) => {
    // const videos = await Video.create(rand_vid)
    // const vid = await Video.updateMany({owner:{$exists :false}}, {$set:{owner:req.user?._id}})
    // console.log(vid);
    // process.exit(1)

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

        // console.log({ title, description,videoLocalPath,thumbnailLocalPath });
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

        // console.log({ title, description, videoLocalPath, thumbnailLocalPath, duration, url, thumbUrl: thumbnail.url });
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