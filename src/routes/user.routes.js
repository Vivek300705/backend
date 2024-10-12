// routes/user.router.js
import { Router } from "express";
import {registerUser,loginUser,logoutUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router();

// Route to register a user with avatar and cover image uploads
router.post(
    "/register", 
    upload.fields([
        { name: "avatar", maxCount: 1 },  // For the avatar
        { name: "coverImage", maxCount: 1 } // For the cover image
    ]), 
    registerUser
);
router.route("/login").post(loginUser)

//secure routes
router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken);

export default router;
