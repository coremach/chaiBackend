import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Take access token from cookies or header

        // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
        const token = req.cookies?.accessToken;

        // Check token is there or not
        if (!token) {
            throw new ApiError(401, "Unauthorized Request!!!")
        }
        // Decode or verify token with access_token_secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // Find user by id taken from decoded token and remove password and refresh token from instance
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        // Check user exist or not
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        // Add user in request
        req.user = user;

        // Pass execution to next
        next()
    } catch (error) {
        console.log({ status: error.statusCode, message: error.stack });
        res.status(error.statusCode).json({ message: error.message })
        // throw new ApiError(401, error?.message || "Invalid access token" )
    }
})