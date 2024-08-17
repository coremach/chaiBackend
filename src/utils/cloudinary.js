import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from 'fs';

const uploadOnCloudinary = async (localFilePath) => {
    // configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        // file has been uploaded successfully
        console.log("file is uploaded on cloudinary", response.url);
        return response.url
    } catch (error) {
        fs.unlinkSync(localFilePath) // Remove the locally saved temporary file as the upload operation failed
        return null
    }
}
export {uploadOnCloudinary};