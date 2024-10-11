import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dkukxhmmy', 
        api_key: '645693333417242',
    api_secret: 'm_SxqgPQ1429mo5716PxH5zsdWI',
});

// Function to upload a file to Cloudinary
const uploadCloudinary = async (localFilePath) => {
    try {
        // Validate the local file path
        if (!localFilePath || !fs.existsSync(localFilePath)) {
            console.error("Invalid file path:", localFilePath);
            return null;
        }

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Automatically detect the resource type (e.g., image, video)
        });

        console.log("Successfully uploaded to Cloudinary:", response.url);
        fs.unlinkSync(localFilePath);
        return response.url;
    } catch (error) {
        // Log the error for debugging
        console.error("Error uploading to Cloudinary:", error.message);
        console.error("Error details:", error);
        
        // Remove the local file if the upload fails
        fs.unlinkSync(localFilePath);
        return null; // Return null if the upload fails
    }
};

export default uploadCloudinary;
