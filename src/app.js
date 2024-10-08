import express from "express";
import cookieParser from "cookie-parser"; // Correct import
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.cors_origin,
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser()); // Correctly use cookieParser as middleware

// Routes import
import userRouter from "./routes/user.routes.js";

// Routes declarations
app.use("/api/v1/users", userRouter);

export default app;
