import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_Name } from "../constants.js";

dotenv.config(); // Ensure .env file is loaded

const connect_db = async () => {
    try {
        // Construct the MongoDB URI from environment variables
        const dbURI = `${process.env.MongoDB_URI}/${DB_Name}`;
        
        // Connect to MongoDB
        const db = await mongoose.connect(dbURI, {
            useNewUrlParser: true,  // Ensure these options are passed to handle deprecation warnings
            useUnifiedTopology: true,
        });

        console.log(`MongoDB connected successfully on host: ${db.connection.host}`);
    } catch (error) {
        // Log the specific error for better debugging
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1); // Exit process if MongoDB connection fails
    }
};

export default connect_db;
