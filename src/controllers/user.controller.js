import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessTokenAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generation refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    try {
        // get user details form frontend
        const { userName, email, fullName, password } = req.body;

        // validation -not empty
        if (
            [fullName, email, userName, password].some((field) => [undefined, null, ""].includes(field?.trim()))
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

        // check if user already exist: userName , email
        const existedUser = await User.findOne({
            $or: [{ email }, { userName }]
        })
        if (existedUser) {
            throw new ApiError(409, "User with email or userName already exists");
        }

        // upload them to cloudinary, avatar
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!avatar) {
            throw new ApiError(400, "Avatar file is required")
        }

        // create user object for mongoDb - create entry in db
        const user = await User.create({
            userName: userName.toLowerCase(),
            email,
            fullName,
            avatar: avatar.url || avatar || "",
            coverImage: coverImage.url || coverImage || "",
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
        console.log({ userName, email, fullName, password, avatarLocalPath, coverImageLocalPath });


        // console.log({ createdUser: createdUser });
        return res.status(201).json(
            new ApiResponse(200, "User Registerd Successfully")
        )
    }
    catch (error) {

        console.log(error.message);
        res.status(error.statusCode).json({
            statuscode: error.statusCode,
            message: error.message,
        })

    }
})

const loginUser = asyncHandler(async (req, res) => {
    try {
        // get userName,email,password from user
        const { userName, email, password } = req.body;
        console.log({ userName, email, password });
        if (
            [userName, email, password].some((field) => [undefined, null, ""].includes(field?.trim()))
        ) {
            throw new ApiError(500, "All fields are required")
        }


        // check user exist in db
        const user = await User.findOne({
            $or: [{ userName }, { email }]
        })
        if (!user) {
            throw new ApiError(404, "User does not exist")
        }

        // check password
        const isPassMatched = await user.isPasswordCorrect(password)
        if (!isPassMatched) {
            throw new ApiError(401, "Password is not correct")
        }
        // refresh token
        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id)

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        // send secure cookies
        const option = {
            httpOnly: true,
            secure: true
        }
        console.log({ loggedInUser});
        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json(new ApiResponse(
                200,
                {
                    "User": { loggedInUser, accessToken, refreshToken }
                },
                "login successfull",
            )
            )

    } catch (error) {
        console.log({ message: error.message },);
        res.status(error.statusCode).json({
            message: error.message,
            statuscode: error.statusCode,
        })

    }
})

const logoutUser = asyncHandler(async (req,res) =>{
    try {
        


        return res.status(200).json(
            new ApiResponse(200, null,"User is logout successfully")
        )
    } catch (error) {
        res.status(error.statusCode).json({
            statusCode: error.statusCode,
            message: error.message
        })
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
}