// controllers/user.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import uploadCloudinary from "../utils/cloudinary.js"; // Ensure this is the correct path

const registerUser = asyncHandler(async (req, res) => {
    const { username, password, email, fullname } = req.body;

    // Validate input fields
    if (!fullname || !username || !password || !email) {
        throw new ApiError("All fields are required", 400);
    }

    // Get the local file path for the avatar
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError("Please upload an avatar", 400);
    }

    // Upload the avatar to Cloudinary
    const avatarResponse = await uploadCloudinary(avatarLocalPath); // Wait for the upload to complete

    // Check if the upload was successful
    if (!avatarResponse) {
        throw new ApiError("Failed to upload avatar to Cloudinary", 500);
    }

    // Create user in the database
    const user = await User.create({
        fullname,
        avatar: avatarResponse, // Use the URL returned from Cloudinary
        username: username.toLowerCase(),
        password,
        email,
    });

    return res.status(201).json({ message: "User registered successfully", user });
});

export default registerUser;
