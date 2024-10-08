import asynchandler from "../utils/asynchandler.js";
import ApiError from "../utils/apierrors.js";
const registerUser=asynchandler(async(req,res)=>{
   const {username,password,email,fullname}=req.body;
   console.log("username: " ,username)


// if(fullname===""){
//     throw new ApiError("fullname is required",400)
// }


})

export default registerUser;