import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app=express();



app.arguments(cors({
    origin:process.env.cors_origin,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"20kb"}))
app.use(express.static("public"))
app.use(express.cookieParser())



export default app;