
import connect_db from "./db/index.js";
// require('dotenv').config({path: './env'})
import dotenv from "dotenv";

dotenv.config(
    {
        path: './env'
    }
);



connect_db()
.then(()=>{
app.on("Error",(error)=>{
    console.error("Server error",error)
    throw error;
    process.exit(1)
 
})

    app.listen(process.env.port||8000 ,()=>{
        console.log(`Server is running on port ${process.env.port}`)
    })
})
.catch((err)=>{
console.log("MongoDB connection failed",err)

})





























// import express from "express";
//  const app = express();

// Middleware
// (async()=>{
//     try{
// await mongoose.connect(`${process.env.MongoDB_uri}/${DB_Name}`)
// app,on("error",()=>{
//     console.log("Error")
//     throw error
// })

// app.listen(process.env.PORT,()=>{
//     console.log(`app`)
// })
//     }
//     catch(error){
//         console.error("Error:", error);
//         throw error;
//         process.exit(1);
//     }
// })()