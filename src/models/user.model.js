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
    // coverimage: {
    //     type: String,
    // },
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
    if (this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function() {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
};

userSchema.methods.generateRefreshToken = async function() {
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
};

export const User = mongoose.model('User', userSchema);
