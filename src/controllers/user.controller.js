import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    
    try {
        // get user details form frontend
        const { username, email, fullName, password } = req.body;
        
        // validation -not empty
        if (
            [fullName, email, username, password].some((field) => [undefined,null,""].includes(field?.trim()))
        ) {
            throw new ApiError(500, "All fields are required")
        }
        
        // check for images, check for avatar file
        let avatarLocalPath;
        if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
            avatarLocalPath = req.files.avatar[0].path
        }
        
        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
        }

        if (!coverImageLocalPath) {
            throw new ApiError(400, "CoverImage file is required")
        }
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar from local file is required")
        }
        
        // check if user already exist: username , email
        const existedUser = await User.findOne({
            $or: [{ email }, { username }]
        })
        if (existedUser) {
            throw new ApiError(409,"User with email or username already exists");
        }
        
        // upload them to cloudinary, avatar
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        
        if (!avatar) {
            throw new ApiError(400, "Avatar file is required")
        } 
        
        // create user object for mongoDb - create entry in db
        const user = await User.create({
            username: username.toLowerCase(),
            email,
            fullName,
            avatar: avatar.url || avatar || "",
            coverImage: coverImage.url || coverImage ||"",
            password,
        })
        
        // remove password and refresh token field from response
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        
        // check for user creation 
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering user")
        }
        // console.log(user.errorResponse);
        console.log({ username, email, fullName, password,avatarLocalPath,coverImageLocalPath});
        
        
        // console.log({ createdUser: createdUser });
        return res.status(201).json(
            new ApiResponse(200, "User Registerd Successfully")
        )
    } 
    catch (error) {

        console.log(error.message);
        res.status(error.statusCode).json({
            statuscode : error.statusCode,
            message:error.message,
        })

    }
})

export { registerUser }