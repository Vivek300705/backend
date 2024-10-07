import mongoose from "mongoose";
import jwt from "jwt";
import bcrypt from "bcrypt";
const userSchema=new Schema({

    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        
    },
    fullname:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        trace:true
        
    },
    avator:{
        type:string,//cloudinary url
        required:true
    },
    coverimage:
    {
        type:string
    },
    watchHistory:{
        type:Schema.Types.ObjectID,
        ref:'Video'
    },
    Password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshtoken:{
        type:String
    },
        timestamps:true,
})
userSchema.pre("save",async function(next){
    if(this.isModified("password")) return next();
    this.password=bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken= async function(){
    returnjwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname,

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.generateRefrehToken= async function(){
    returnjwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const User=mongoose.model('User',userSchema);