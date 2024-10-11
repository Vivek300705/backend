import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apierrors.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
 const verifyJWT= asyncHandler(async(req, res, next)=>
{try {
    
        const token=req.cookies?.accesToken || req.header("Authorization")?.replace("Bearer","")
    if (!token) {
        throw new ApiError(401,"unauthorized token");
    }
    
    const decodedToken= await jwt.verify(token,process.env.REFRESH_TOKEN_SECRET)
    
    const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError("invalid access token",401);
        
    }
    req.user=user;
    next()
} catch (error) {
    throw new ApiError(error?.message||"invalid token",401)
    
}


})
export default verifyJWT;