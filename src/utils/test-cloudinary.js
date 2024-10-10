import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
cloud_name: dkukxhmmy, 
        api_key: 645693333417242,
    api_secret: m_SxqgPQ1429mo5716PxH5zsdWI,
});

const testImagePath = "./public/temp"; // Replace with the path of an image file

const uploadToCloudinary = async () => {
    try {
        const result = await cloudinary.uploader.upload(testImagePath);
        console.log("Cloudinary Upload Result:", result);
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error.message);
    }
};

uploadToCloudinary();
