import {v2 as cloudinary} from cloudinary;
import fs from fs;

// import { v2 as cloudinary } from 'cloudinary';

(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_ // Click 'View API Keys' above to copy your API secret
    });
    
    const uploadcloudinary=async(localFilePath,)=>{
        try {
            if(!localFilePath) return null;
            const response=await cloudinary.upload(localFilePath ,{resource_type:"auto"})//file has been uploaded
            console.log("successfully uploaded cloudinary",response.url);
            return response.url;
        } catch (error) {
            fs.unlinksSync(localFilePath);
            return null;
        }
    }
});