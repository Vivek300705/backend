import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import uploadCloudinary from "../utils/cloudinary.js"; // Ensure this is the correct path
import apiResponse from "../utils/apiResponse.js";

// Generate Access and Refresh Token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token to the user model
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError("Something went wrong while generating tokens", 500);
  }
};

// Register User
export const registerUser = asyncHandler(async (req, res) => {
  const { username, password, email, fullname } = req.body;

  // Validate input fields
  if (!fullname || !username || !password || !email) {
    throw new ApiError("All fields are required", 400);
  }

  // Get the local file path for the avatar and cover image
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError("Please upload an avatar", 400);
  }

  // Upload the avatar to Cloudinary
  const avatarResponse = await uploadCloudinary(avatarLocalPath);
  if (!avatarResponse) {
    throw new ApiError("Failed to upload avatar to Cloudinary", 500);
  }

  let coverImageUrl = null;
  if (coverImageLocalPath) {
    coverImageUrl = await uploadCloudinary(coverImageLocalPath);
    if (!coverImageUrl) {
      throw new ApiError("Failed to upload cover image to Cloudinary", 500);
    }
  }

  // Create the user in the database
  const user = await User.create({
    fullname,
    avatar: avatarResponse, // Use the URL returned from Cloudinary
    coverImage: coverImageUrl || "", // Use the cover image URL if it exists
    username: username.toLowerCase(),
    password,
    email,
  });

  return res.status(201).json({ message: "User registered successfully", user });
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Validate required fields
  if (!username && !email) {
    throw new ApiError("Username or email is required", 400);
  }

  // Find the user by username or email
  const user = await User.findOne({
    $or: [{ username: username?.toLowerCase() }, { email }],
  });
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError("Invalid password", 400);
  }

  // Generate access and refresh tokens
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser=await user.findById(user._id);
  select("-password -refreshToken")//jo fields nhi chahiye iske liye istemal karte hai 

  const option={
    httpOnly: true,
    secure:true,
  }
  return res
  .status(200)
  .cookie("accessToken",accessToken,option)
  .cookie("refreshToken",refreshToken,option)
  .json(
    new apiResponse(
      200,{
      user: loggedInUser,accessToken,refreshToken
      },
      "user logged in successfully"
    )
  )
});
export const logoutUser=asyncHandler(async (req, res) => {
await user.findByIdAndUpdate(
  req.user._id,
  {
    $set:{
      refreshToken:undefined,
    },
    
      new:true
    
  }
)
const options={
  httpOnly: true,
  secure:true
}
return res
.status(200)
.clearcookie("accessToken",options)
.clearcookie("refreshToken",options)
json(
  new apiResponse(
    200,
    {},
    "user logged out successfully"
  )
 
)
})

// export default { registerUser };
