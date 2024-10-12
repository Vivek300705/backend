import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrors.js"; // Ensure ApiError is imported correctly
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();

        // Validate if token exists
        if (!token) {
            throw new ApiError("Unauthorized: No token provided", 401);
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Ensure you use the correct secret for access token

        // Fetch the user based on the decoded token's ID
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        // Check if user exists
        if (!user) {
            throw new ApiError("Invalid access token: User not found", 401);
        }

        // Attach the user to the request object
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // Handle token verification errors
        const errorMessage = error instanceof jwt.JsonWebTokenError ? "Invalid token" : error.message || "Unauthorized access";
        throw new ApiError(errorMessage, 401);
    }
});

export default verifyJWT;
