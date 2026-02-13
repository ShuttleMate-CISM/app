import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "user",
    },
    phoneNumber: {
        type: String,
    
    },
    
    address1: {
        type: String,
    },
    address2: {
        type: String,
    },
   
    postalCode: {
        type: String,
    },
    });

    const User = mongoose.model("User", userSchema);

    export default User;
