import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import path from "path";

const uploadOnCloudinary = async (filePath, resourceType = "auto") => {
    try {
        if (!filePath) {
            return null;
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        // If Cloudinary is not configured, fall back gracefully to local static files
        if (!cloudName || !apiKey || !apiSecret) {
            const fileName = path.basename(filePath);
            return `/public/${fileName}`;
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
        });

        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: resourceType,
            folder: "educonnect"
        });

        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (unlinkErr) {
                console.error("Failed to delete temp file:", unlinkErr);
            }
        }

        return uploadResult.secure_url;

    } catch (error) {
        console.error("Cloudinary upload error:", error);
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (unlinkErr) {
                console.error("Failed to delete temp file on error:", unlinkErr);
            }
        }
        return null;
    }
};

export default uploadOnCloudinary;