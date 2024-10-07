import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const connect_db=async() =>{
    try{const db=await mongoose.connect(`${process.env.MongoDB_uri}/${DB_Name}`)
        console.log(`MongoDB connected successfully on ${db.connection.host}`)
    }
    catch(error){
        console.log("Mongodb error")
        process.exit(1)

    }
}

export default connect_db;