import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const healthcheck = asyncHandler(async(req,res,next)=>{
    try {
        return res.status(200).json(new ApiResponse(200 ,null , "Health Check successfull"))
    } catch (error) {
     return next(error)   
    }
})
export {healthcheck}