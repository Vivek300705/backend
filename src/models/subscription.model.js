import mongoose from "mongoose";    
const subscriptionSchema =new mongoose.Schema({
subscription:{
    type: mongoose.Schema.Types.ObjectId,//jo subscribe kar rha hai
    ref: "User"
},
channel:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel"
}
 },{timestamps:true});





export const subscription=mongoose.model("subscription",subscriptionSchema)