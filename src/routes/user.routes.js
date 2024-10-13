// routes/user.router.js
import { Router } from "express";
import {registerUser,loginUser,logoutUser,refreshAccessToken,
    changeCurrentPassword,
    updateAccountdata,
    getCurrentUser,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory,
} from "../controllers/user.controller.js";
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
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").post(verifyJWT,getCurrentUser);
router.route("/update-account").patch(verifyJWT,updateAccountdata);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateCoverImage);
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/watchhistory").get(verifyJWT,getWatchHistory);

export default router;
