// routes/user.router.js
import { Router } from "express";
import registerUser from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Route to register a user with avatar upload
router.post("/register", upload.single("avatar"), registerUser);

export default router;
