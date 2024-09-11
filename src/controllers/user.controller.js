import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const randomAC =
    [
        {
            "username": "jollyPineapple",
            "email": "sunnyday123@mail.com",
            "fullName": "Olivia Thompson",
            "avatar": "avatar_olivia.jpg",
            "coverImage": "cover_olivia.jpg",
            "password": "Qwerty!234"
        },
        {
            "username": "curiousPanda",
            "email": "panda_lover456@mail.com",
            "fullName": "Ethan Carter",
            "avatar": "avatar_ethan.jpg",
            "coverImage": "cover_ethan.jpg",
            "password": "Password!789"
        },
        {
            "username": "mysticFalcon",
            "email": "falcon_watcher789@mail.com",
            "fullName": "Sophia Martinez",
            "avatar": "avatar_sophia.jpg",
            "coverImage": "cover_sophia.jpg",
            "password": "Secret123!"
        },
        {
            "username": "happyKoala",
            "email": "koala_friends@mail.com",
            "fullName": "Liam Johnson",
            "avatar": "avatar_liam.jpg",
            "coverImage": "cover_liam.jpg",
            "password": "Koala!456"
        },
        {
            "username": "braveTiger",
            "email": "tiger_fan@mail.com",
            "fullName": "Ava Wilson",
            "avatar": "avatar_ava.jpg",
            "coverImage": "cover_ava.jpg",
            "password": "Roar!789"
        },
        {
            "username": "slyFox",
            "email": "foxy_buddy@mail.com",
            "fullName": "Mason Lee",
            "avatar": "avatar_mason.jpg",
            "coverImage": "cover_mason.jpg",
            "password": "Fox!1234"
        },
        {
            "username": "dreamyCloud",
            "email": "cloudy_sky@mail.com",
            "fullName": "Isabella Harris",
            "avatar": "avatar_isabella.jpg",
            "coverImage": "cover_isabella.jpg",
            "password": "Cloud!4567"
        },
        {
            "username": "wittySparrow",
            "email": "sparrow_song@mail.com",
            "fullName": "Noah Brown",
            "avatar": "avatar_noah.jpg",
            "coverImage": "cover_noah.jpg",
            "password": "Tweet!8910"
        },
        {
            "username": "cheerfulOtter",
            "email": "otter_buddy@mail.com",
            "fullName": "Emma Davis",
            "avatar": "avatar_emma.jpg",
            "coverImage": "cover_emma.jpg",
            "password": "Otter!2345"
        },
        {
            "username": "boldHedgehog",
            "email": "hedgehog_love@mail.com",
            "fullName": "James Wilson",
            "avatar": "avatar_james.jpg",
            "coverImage": "cover_james.jpg",
            "password": "Hedgehog!6789"
        }
    ]
const generateAccessTokenAndRefreshTokens = async (userId) => {
    try {
        // Retrieve the user from the database using the provided userId
        const user = await User.findById(userId);

        // Generate a new access token for the user
        const accessToken = await user.generateAccessToken();

        // Generate a new refresh token for the user
        const refreshToken = await user.generateRefreshToken();

        // Store the refresh token in the user's record
        user.refreshToken = refreshToken;

        // Save the user record without validating the fields
        await user.save({ validateBeforeSave: false });

        // Return the newly generated access and refresh tokens
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generation refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Insert random accounts to Register Collection for testing purpuse
    // const user = await User.insertMany(randomAC)
    // console.log(user);
    // return res.status(200).json({message:"ok",data:user})

    try {
        // Get user details from the frontend
        const { username, email, fullName, password } = req.body;

        // Validation - check that fields are not empty
        if (
            [fullName, email, username, password].some((field) => [undefined, null, ""].includes(field?.trim()))
        ) {
            throw new ApiError(500, "All fields are required");
        }

        // Check for images, specifically the avatar file
        let avatarLocalPath;
        if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
            avatarLocalPath = req.files.avatar[0].path;
        }

        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        // Ensure both cover image and avatar are provided
        if (!coverImageLocalPath) {
            throw new ApiError(400, "Cover image file is required");
        }
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required");
        }

        // Check if user already exists by username or email
        const existedUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        if (existedUser) {
            throw new ApiError(409, "User with email or username already exists");
        }

        // Upload avatar and cover image to Cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!avatar) {
            throw new ApiError(400, "Avatar file upload failed");
        }

        // Create user object and save to MongoDB
        const user = await User.create({
            username: username.toLowerCase(),
            email,
            fullName,
            avatar: avatar.url || avatar || "",
            coverImage: coverImage.url || coverImage || "",
            password,
        });

        // Remove password and refresh token field from the response
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        // Check for successful user creation
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering user");
        }

        // Return success response after user registration
        return res.status(200).json(
            new ApiResponse(200, createdUser, "User Registered Successfully")
        );

    }
    catch (error) {
        res.status(error.statusCode).json({
            statuscode: error.statusCode,
            message: error.message,
        })

    }
})

const loginUser = asyncHandler(async (req, res) => {
    try {
        // Get userName, email, and password from the request body
        const { userName, email, password } = req.body;

        // Check if any of the fields are undefined, null, or empty; if so, throw an error
        if (
            [userName, email, password].some((field) => [undefined, null, ""].includes(field?.trim()))
        ) {
            throw new ApiError(500, "All fields are required");
        }

        // Check if the user exists in the database
        const user = await User.findOne({
            $or: [{ userName }, { email }]
        });
        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

        // Check if the provided password matches the user's password
        const isPassMatched = await user.isPasswordCorrect(password);
        if (!isPassMatched) {
            throw new ApiError(401, "Password is not correct");
        }

        // Generate new access and refresh tokens for the user
        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id);

        // Retrieve the logged-in user without sensitive fields
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        // Set options for the secure cookies to be sent in the response
        const option = {
            httpOnly: true,
            secure: true,
        };

        // Send the response with secure cookies containing the access and refresh tokens
        return res.status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json(
                new ApiResponse(200, loggedInUser, "User logged in successfully")
            );

    } catch (error) {
        res.status(error.statusCode).json({
            message: error.message,
            statuscode: error.statusCode,
        })

    }
})

const logoutUser = asyncHandler(async (req, res) => {
    try {
        // Remove the refresh token from the user's record in the database
        await User.findByIdAndUpdate(
            req.user._id,
            { $unset: { refreshToken: 1 } },
            { new: true }
        );

        // Set options for the cookies to be cleared
        const option = {
            httpOnly: true,
            secure: true,
        };

        // Send a response to clear the access and refresh tokens from cookies
        return res
            .status(200)
            .clearCookie("accessToken", option)
            .clearCookie("refreshToken", option)
            .json(
                new ApiResponse(200, null, "User is logged out successfully")
            );

    } catch (error) {
        res.status(error.statusCode).json({
            statusCode: error.statusCode,
            message: error.message
        })
    }
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    try {
        // Get the incoming refresh token from cookies or request body
        const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        // Check if the incoming refresh token is undefined or missing; if so, throw an error
        if (incommingRefreshToken == 'undefined' || !incommingRefreshToken) {
            throw new ApiError(401, "Unauthorised request");
        }

        // Verify the incoming refresh token using the secret key
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Retrieve the user associated with the decoded token from the database
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Unauthorised request");
        }

        // Check if the user's stored refresh token matches the incoming refresh token
        if (user?.refreshToken !== incommingRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        // Set options for the cookies to be sent in the response
        const options = {
            httpOnly: true,
            secure: true
        };

        // Send a response with new access and refresh tokens set as cookies
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken: accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );

    } catch (error) {

        res.status(error.statusCode).json({
            statusCode: error.statusCode,
            message: error.message
        })
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
        // Destructure oldPassword and newPassword from the request body
        const { oldPassword, newPassword } = req.body;

        // Check if the new password is the same as the old password; if so, throw an error
        if (oldPassword === newPassword) {
            throw new ApiError(400, "new password and old password are same");
        }

        // Retrieve the user from the database using the user's ID from the request
        const user = await User.findById(req?.user._id);

        // Check if the old password is correct using the user's method
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid old password");
        }

        // Update the user's password to the new password
        user.password = newPassword;

        // Save the updated user without validating the password field
        await user.save({ validateBeforeSave: false });

        // Return a success response indicating the password was changed successfully
        return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully!!!"));

    } catch (error) {
        res.status(error.statusCode).json({
            statusCode: error.statusCode,
            message: error.message
        })
    }
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "current user fetched successfully!!!"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    try {
        // Destructure fullName and email from the request body
        const { fullName, email } = req.body;

        // Check if both fullName and email are provided; if not, throw an error
        if (!fullName || !email) {
            throw new ApiError(400, "All fields are required");
        }

        // Update the user's fullName and email in the database and return the updated user without sensitive fields
        const updatedUser = await User.findByIdAndUpdate(req.user?._id,
            { $set: { fullName: fullName, email: email } },
            { new: true }
        ).select("-password -refreshToken");

        // Return a success response with the updated user information
        return res.status(200).json(new ApiResponse(200, { user: updatedUser }, "Account Details updated successfully!!!"));

    } catch (error) {
        res.status(error.statusCode).json({
            statusCode: error.statusCode,
            message: error.message
        })
    }
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    try {
        // Get the local path of the uploaded avatar image from the request
        const avatarLocalPath = req.file?.path;

        // TODO: Delete the old avatar image from storage - assignment

        // Check if the avatar path is missing; if so, throw an error
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is missing");
        }

        // Upload the avatar image to Cloudinary and wait for the response
        const avatar = await uploadOnCloudinary(avatarLocalPath);

        // Check if the upload was successful; if not, throw an error
        if (!avatar.url) {
            throw new ApiError(400, "Error while uploading on cloudinary");
        }

        // Update the user's avatar in the database and return the updated user without sensitive fields
        const user = await User.findByIdAndUpdate(req.user?._id,
            { $set: { avatar: avatar.url } },
            { new: true }
        ).select("-password -refreshToken");

        // Return a success response with a message indicating the avatar was updated successfully
        return res.status(200).json(new ApiResponse(200, {}, "Avatar updated successfully"));

    } catch (error) {
        res.status(error.statusCode).json({
            statusCode: error.statusCode,
            message: error.message
        })
    }
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    try {
        // Get the local path of the uploaded cover image from the request
        const coverImageLocalPath = req.file?.path;

        // Check if the cover image path is missing; if so, throw an error
        if (!coverImageLocalPath) {
            throw new ApiError(400, "coverImage file is missing");
        }

        // Upload the cover image to Cloudinary and wait for the response
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        // Check if the upload was successful; if not, throw an error
        if (!coverImage.url) {
            throw new ApiError(400, "Error while uploading on cloudinary");
        }

        // Update the user's cover image in the database and return the updated user without sensitive fields
        const user = await User.findByIdAndUpdate(req.user?._id,
            { $set: { coverImage: coverImage.url } },
            { new: true }
        ).select("-password -refreshToken");

        // Return a success response with the updated user information
        return res.status(200).json(new ApiResponse(200, user, "CoverImage updated successfully"));

    } catch (error) {
        res.status(error.statusCode).json({
            statusCode: error.statusCode,
            message: error.message
        })
    }
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    try {
        const { username } = req.params

        if (!username?.trim()) {
            throw new ApiError(400, "Username is missing")
        }
        const channel = await User.aggregate([
            { $match: { username: username?.toLowerCase() } },
            {
                $lookup: {
                    from: "Subscription",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "Subscription",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscribersCounts: { $size: "$subscribers" }, channelsSubscribedToCount: { $size: "$subscribedTo" },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCounts: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1,

                }
            }

        ])

        if (!channel?.length) {
            throw new ApiError(404, "channel not found")
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, channel[0], "User channel fetched successfully")
            )
    } catch (error) {
        res.status(error.statusCode).json({ message: error.message })
    }
})

const getWatchHistroy = asyncHandler(async (req, res) => {
    try {
        const user = await User.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(req.user._id) }
            },
            {
                $lookup: {
                    from: "Video",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchedHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "User",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            "fullName": 1,
                                            "username": 1,
                                            "avatar": 1,
                                            "watchedHistory": 1,
                                            "owner": 1,
                                            "coverImage": 1,
                                            "password": 1
                                        },
                                    }
                                ]
                            }
                        },
                        { $addFields: { owner: { $first: "$owner" } } }
                    ]
                }
            },
            {
                $project: {
                    "watchedHistory": 1,
                    "username": true
                }
            }
        ])
        if (!user) {
            new ApiError(500, "Something went wrong while fetching watch History from user Collection")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, user[0], "watched history fetched successfully"))


    } catch (error) {
        return res.status(error.statusCode).json({ message: error.message })
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistroy,
}