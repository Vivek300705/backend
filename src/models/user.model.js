import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    avatar: { // Fixed typo from avator to avatar
        type: String, // cloudinary url
        required: false,
    },
    covermage: {
        type: String,
    },
    watchHistory: [{ // Changed to an array of ObjectIds
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
    }],
    password: { // Fixed capitalization from Password to password
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: { // Fixed capitalization from refreshtoken to refreshToken
        type: String,
    },
}, {
    timestamps: true,
});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next(); // Only hash if password is new or modified
    this.password = await bcrypt.hash(this.password, 10); // Hash the password
    next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password); // Compare provided password with hashed password
};


userSchema.methods.generateAccessToken = function () {
    const expiresIn = "1h"; // Ensure this is valid
    return jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: expiresIn,
    });
};

userSchema.methods.generateRefreshToken = function () {
    const expiresIn = "30d"; // Ensure this is valid
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: expiresIn,
    });
};

export const User = mongoose.model('User', userSchema);
