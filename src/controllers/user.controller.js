import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    try {
        // get user details form frontend
        const { username, email, fullname, password } = req.body;
        console.log({ username, email, fullname,password });
        // validation -not empty
        if (
            [fullname, email, username, password].some((field) => field?.trim() == "")
        ) {
            throw new ApiError(400, "All fields are required")
        }

        // check if user already exist: username , email
        const existedUser = User.findOne({
            $or: [{ email }, { username }]
        })
        console.log(existedUser);
        
        if (existedUser) {
            throw new ApiError(409, "User with email or username already exists")
        }
        // check for images, check for avatar file
        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path;
        // upload them to cloudinary, avatar
        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is required")
        }
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        if(!avatar){
            throw new ApiError(400,"Avatar file is required")
        }
        // create user object for mongoDb - create entry in db
        const user =  await User.create({
            fullname :fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            password : password,
            username : username.toLowerCase()
        })
        // remove password and refresh token field from response
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken" 
        )
        // check for user creation 
        if(!createdUser){
            throw new ApiError(500,"Something went wrong while registering user")
        }

        return res.status(201).json(
            new ApiResponse(200,createdUser,"User Registerd Successfully")
        )
    } catch (error) {
        console.log(error)
    }

    // return response
})

export { registerUser }