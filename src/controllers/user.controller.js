import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import uploadCloudinary from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import bcrypt from "bcrypt"
import { jwt } from "jsonwebtoken";

// Generate Access and Refresh Token
const generateAccessAndRefreshToken = async (userId) => {
  try {
      const user = await User.findById(userId);
      if (!user) {
          throw new ApiError("User not found", 404);
      }

      // Generate tokens
      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();
      console.log(accessToken, refreshToken);

      // Debug: Log generated tokens
      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);

      // Save the refresh token to the user model
      user.refreshToken = refreshToken;

      // Save user with updated refreshToken, without validating other fields
      await user.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
  } catch (error) {
      console.error("Error generating tokens:", error); // Log the error for debugging
      throw new ApiError("Something went wrong while generating tokens", 500);
  }
};


// Register User
export const registerUser = asyncHandler(async (req, res) => {
    const { username, password, email, fullname } = req.body;

    // Debug: Log incoming registration data
    console.log("Incoming registration data:", req.body);

    // Validate input fields
    if (!fullname || !username || !password || !email) {
        console.error("Validation Error: All fields are required.");
        throw new ApiError("All fields are required", 400);
    }

    // Get the local file path for the avatar and cover image
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // Debug: Check if files are uploaded correctly
    console.log("Avatar path:", avatarLocalPath);
    console.log("Cover image path:", coverImageLocalPath);

    if (!avatarLocalPath) {
        console.error("Validation Error: Please upload an avatar.");
        throw new ApiError("Please upload an avatar", 400);
    }

    // Upload the avatar to Cloudinary
    const avatarResponse = await uploadCloudinary(avatarLocalPath);
    if (!avatarResponse) {
        console.error("Upload Error: Failed to upload avatar to Cloudinary.");
        throw new ApiError("Failed to upload avatar to Cloudinary", 500);
    }

    let coverImageUrl = null;
    if (coverImageLocalPath) {
        coverImageUrl = await uploadCloudinary(coverImageLocalPath);
        if (!coverImageUrl) {
            console.error("Upload Error: Failed to upload cover image to Cloudinary.");
            throw new ApiError("Failed to upload cover image to Cloudinary", 500);
        }
    }

    // Create the user in the database
    const user = await User.create({
        fullname,
        avatar: avatarResponse,
        coverImage: coverImageUrl || "",
        username: username.toLowerCase(),
        password,
        email,
    });

    return res.status(201).json({ message: "User registered successfully", user });
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Debug: Log incoming login data
    console.log("Incoming login data:", req.body);

    // Validate required fields
    if (!username && !email) {
        console.error("Validation Error: Username or email is required.");
        throw new ApiError("Username or email is required", 400);
    }

    // Find the user by username or email
    const user = await User.findOne({
        $or: [{ username: username?.toLowerCase() }, { email }],
    });
    if (!user) {
        console.error("Authentication Error: User not found.");
        throw new ApiError("User not found", 404);
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError("Invalid password", 400);
    }

    // Generate access and refresh tokens
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200, {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

// Logout User
export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new apiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken =req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError("Refresh token is required", 401);
    }
try {
    const decodedToken=jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
    )
    
    const user=await User.findById(decodedToken?._id)
    
    if (!user) {
        throw new ApiError("User not found", 404);
    }
    
    if (incomingRefreshToken !== user.refreshToken){
        throw new ApiError("Invalid refresh token", 401);
    }
    
    const options={
        httpOnly: true,
        secure: true,
    }
    
    const{accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)
    
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
        new apiResponse(
            200,
            {
                // user: user.toObject({ getters: true }),
                accessToken,
                newrefreshToken
            },
            "User's access token refreshed successfully"
        )
     );
} catch (error) {
    throw new ApiError(401,error?.message||"invalid refresh token")
}



});



export default {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
};
