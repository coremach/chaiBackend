import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {

    // get user details form frontend
    const { username, email, fullName, password } = req.body;
    console.log({ username, email, fullName, password });
    // validation -not empty
    if (
        [fullName, email, username, password].some((field) => field?.trim() == "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exist: username , email
    const existedUser = await User.findOne({
        $and: [{ email }, { username }]
    })
    // console.log(Object.keys( existedUser ));
    // console.log("second log : ",existedUser.op || "didn't found");

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
    // check for images, check for avatar file
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // console.log({avatarLocalPath:avatarLocalPath,coverImageLocalPath:coverImageLocalPath});
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // upload them to cloudinary, avatar
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    // create user object for mongoDb - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase()
    })
    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // check for user creation 
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registerd Successfully")
    )

})

export { registerUser }