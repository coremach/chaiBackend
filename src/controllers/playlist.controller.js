import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const createPlaylist = asyncHandler(async (req, res, next) => {
    try {
        // Retrieves name and discription from the request body and return error if it's empty.
        const { name, description, videoId } = req.body;
        if ([name, description].some((field) => [undefined, "", null].includes(field?.trim()))) {
            return next(new ApiError(400, "Name or description  is empty"))
        }

        // Creates a new playlist with the provided name and description
        const playlist = await Playlist.create({
            name, description,
            owner: req.user?._id,
        })
        // if video Id retrive from body push it into created playlist
        if (videoId) {
            // Return error, if video id is invalid
            if (!mongoose.Types.ObjectId.isValid(videoId)) {
                return next(new ApiError(400, "Invalid Video Id"))
            }
            playlist.video.push(videoId)
            await playlist.Save()
        }
        // Checks if the playlist creation was unsuccessful; returns an error if it was.
        if (!playlist) {
            return next(new ApiError(500, "Something went wrong while creating Playlist"))
        }
        // Returns a success response with the playlist.
        return res.status(200).json(new ApiResponse(200, playlist, "Playlist created successfully"))
    } catch (error) {
        return next(error)
    }
})

const getPlaylistById = asyncHandler(async (req, res, next) => {
    try {
        // Retrieves the video ID from the request parameters and return error if it's invalid
        const playlistId = req.params.playlistId;
        if (!mongoose.Types.ObjectId.isValid(playlistId)) {
            return next(new ApiError(400, "Invalid Playlist Id"))
        }

        // Fetch playlist and return error if it's fails
        const getPlaylist = await Playlist.findById(playlistId)
        if (!getPlaylist) {
            return next(new ApiError(500, "Playlist doesn't exist in Playlist Collection"))
        }

        // Returns a success response with the getPlaylist.
        return res.status(200).json(new ApiResponse(200, getPlaylist, "Playlist fetched successfully"))
    } catch (error) {
        return next(error)
    }
})

const updatePlaylist = asyncHandler(async (req, res, next) => {
    try {
        // Retrieves name and discription from the request body and return error if it's empty.
        const { name, description } = req.body;
        if ([name, description].some((field) => [undefined, "", null].includes(field?.trim()))) {
            return next(new ApiError(400, "Name or discription  is empty"))
        }
        // Retrieves the video ID from the request parameters and return error if it's invalid
        const playlistId = req.params.playlistId;
        if (!mongoose.Types.ObjectId.isValid(playlistId)) {
            return next(new ApiError(400, "Invalid Playlist Id"))
        }

        // Checks if the playlist exists in the Playlist collection and return error if not exist.
        const isPlaylistExist = await Playlist.findById(playlistId)
        if (!isPlaylistExist) {
            return next(new ApiError(500, "Playlist Doen't Exist"))
        }
        // Updates the name and description of the playlist in the MongoDB collection.
        const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
            { $set: { name, description } },
            { new: true }
        )
        if (!updatedPlaylist) {
            return next(new ApiError(500, "Something went wrong while updating name and desciption in Playlist Collection"))
        }
        // Return a success response with the updatedPlaylist
        return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
    } catch (error) {
        return next(error)
    }
})

const deletePlaylist = asyncHandler(async (req, res, next) => {
    try {
        // Retrieves the video ID from the request parameters and return error if it's invalid
        const playlistId = req.params.playlistId;
        if (!mongoose.Types.ObjectId.isValid(playlistId)) {
            return next(new ApiError(400, "Invalid Playlist Id"))
        }

        // Checks if the playlist exists in the Playlist collection and return error if not exist.
        const isPlaylistExist = await Playlist.findById(playlistId)
        if (!isPlaylistExist) {
            return next(new ApiError(500, "Playlist Doen't Exist"))
        }
        // Delete a playlist by it ID
        const deletePlaylist = await Playlist.deleteOne(new mongoose.Types.ObjectId(playlistId))
        if (!deletePlaylist) {
            return next(new ApiError(500, "Something went wrong while deleting playlist from Playlist Collection"))
        }

        // Return a success response with the deletePlaylist
        return res.status(200).json(new ApiResponse(200, deletePlaylist, "Playlist deleted successfully"))
    } catch (error) {
        return next(error)
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res, next) => {
    try {
        // Retrieves the video ID and playlist ID from the request parameters 
        // And return error if it's invalid
        const { videoId, playlistId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(videoId) && !mongoose.Types.ObjectId.isValid(playlistId)) {
            return next(new ApiError(400, "Invalid Video Id or Playlist ID"))
        }
        // Checks if the playlist exists in the Playlist collection and return error if not exist.
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            return next(new ApiError(500, "Playlist Doen't Exist"))
        }
        // Push video Id in Playlist
        playlist.videos.push(new mongoose.Types.ObjectId(videoId))
        await playlist.save()

        // Return a success response with updated playlist
        return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"))
    } catch (error) {
        return next(error)
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res, next) => {
    try {
        // Retrieves the video ID and playlist ID from the request parameters 
        // And return error if it's invalid
        const { videoId, playlistId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(videoId) && !mongoose.Types.ObjectId.isValid(playlistId)) {
            return next(new ApiError(400, "Invalid Video Id or Playlist ID"))
        }
        // Checks if the playlist exists in the Playlist collection and return error if not exist.
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            return next(new ApiError(500, "Playlist Doen't Exist"))
        }
        // Remove Video from playlist and return error ,if it's failed
        const updatedPlaylist = await Playlist.updateOne(
            {_id : playlist},
            {$pull : {videos : videoId}}
        )
        if(!updatedPlaylist){
            return next(new ApiError(500,"Something went wrong while removing video Id from playlist"))
        }
        // Return a success response with the updated playlist
        return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"))
    } catch (error) {
        return next(error)
    }
})

const getUserPlaylist = asyncHandler(async (req, res, next) => {
    try {
        // Retrive user ID from the parameter and return error if it's not valid
        const { userId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return next(new ApiError(400,"Invalid User Id"))
        }
        // Fetch Playlist by user Id , return error if it doesn't exist
        const playlist = await Playlist.find({owner:userId})
        if(!playlist){
            return next(new ApiError(404, "Playlist doesn't exist in Playlist Collection"))
        }
        // Return a success resonse with the playlist
        return res.status(200).json(new ApiResponse(200, playlist, "Fetched video by userId successfully"))
    } catch (error) {
        return next(error)
    }
})


export {
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getUserPlaylist,
}