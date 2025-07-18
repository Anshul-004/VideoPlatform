import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true //makes useful for searching
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true  
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    avatar: {
        type: String, //URL of Third Party Storage Service
        required: true,
    },
    coverImage: {
        type: String, //Image URL
    },
    watchHistory: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
        }   
    ],
    password: {
        type: String, //Issue : how to manage and encrypt ?
        required: [true, "Password is required."]
    },
    refreshToken: {
        type: String
    }


},{timestamps:true});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next(); //isModified returns wether password is changed.
    this.password = await bcrypt.hash(this.password, 8);
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){ //new method in schema
    return await bcrypt.compare(password, this.password); //password is the string & this.password is the encrypted version
}
//JWT TOKENS
userSchema.methods.generateAccessToken = function (){
    // console.log(process.env.ACCESS_TOKEN_EXPIRY)
    return jwt.sign(
        { 
            //this -> database
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefereshToken = function (){
    // console.log(process.env.REFRESH_TOKEN_EXPIRY)
    return jwt.sign({ //this refers to the database 
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
export const User = mongoose.model("User", userSchema);