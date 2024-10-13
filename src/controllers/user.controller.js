import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import uploadCloudinary from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import bcrypt from "bcrypt";
import  jwt  from "jsonwebtoken";
import mongoose from 'mongoose';


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
            console.error(
                "Upload Error: Failed to upload cover image to Cloudinary."
            );
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

    return res
        .status(201)
        .json({ message: "User registered successfully", user });
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
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

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
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
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
        .json(new apiResponse(200, {}, "User logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError("Refresh token is required", 401);
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError("User not found", 404);
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError("Invalid refresh token", 401);
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newrefreshToken } =
            await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    {
                        // user: user.toObject({ getters: true }),
                        accessToken,
                        newrefreshToken,
                    },
                    "User's access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token");
    }
});
export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await bcrypt.compare(oldpassword, user.password);
    if (!isPasswordCorrect) {
        throw new ApiError("Invalid password", 400);
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new apiResponse(200, {}, "Password changed successfully"))
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(200, req.user, "user fetched successfully")
})
export const updateAccountdata = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;
    if (!fullname || !email) {
        throw new ApiError("Fullname and email are required", 400);
    }
    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { fullname, email }
        },
        { new: true }
    ).select("-password")
    return res.status(200).json(new apiResponse(200, user, "account details updated successfully"))
});

export const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError("Validation Error: Please upload an avatar.", 400);
    }
    const avatar = await uploadCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new ApiError("Upload Error: Failed to upload avatar to Cloudinary.", 500);
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: { avatar: avatar.url }
        }, { new: true }
    ).select("-password")
    return res.status(200).json(new apiResponse(200, user, "avatar details updated successfully"))
})
export const updateCoverImage = asyncHandler(async (req, res) => {
    const CoverImageLocalPath = req.file?.path;
    if (!CoverImageLocalPath) {
        throw new ApiError("Validation Error: Please upload an CoverImage.", 400);
    }
    const CoverImage = await uploadCloudinary(CoverImageLocalPath)
    if (!CoverImage) {
        throw new ApiError("Upload Error: Failed to upload CoverImage to Cloudinary.", 500);
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: { CoverImage: CoverImage.url }
        }, { new: true }
    ).select("-password")
    return res.status(200).json(new apiResponse(200, user, "coverImage details updated successfully"))
})
export const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError("Validation Error: Username is required.", 400);
    }
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])
    console.log(channel)
    return res
    .status(200)
    .json(
        new apiResponse(200, channel[0] || channel, "User channel fetched successfully")
    );
    if(!channel?.length){
        throw new ApiError("channel not found", 404);
    }
});




// import mongoose from 'mongoose'; // Ensure mongoose is imported

export const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id), // Correct usage of ObjectId
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        avatar: 1,
                                        username: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner", // Assign the first owner from the array
                            },
                        },
                    },
                ],
            },
        },
    ]);

    if (!user.length) {
        return res.status(404).json(new apiResponse(404, [], "No watch history found"));
    }

    return res.status(200).json(
        new apiResponse(200, user[0].watchHistory || [], "Watch history fetched successfully")
    );
});




