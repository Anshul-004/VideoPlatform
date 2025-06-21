import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadFile} from '../utils/fileUpload.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const registerUser = asyncHandler( async (req,res) => {
    
    //Get data from frontend
    const {fullName, email, username, password} = req.body;
    console.log(fullName, email, username, password);
    
    //vaildate it
    if([fullName, email, username, password].some((field) => {field?.trim() === ""}))
        {    
            throw new ApiError(400, "All Fields Required")//NAYA OBJECT BANAYA USS CLASS KA
        } 
    
    // check if user exists
    // IMPORT User Model (As it can communicate directly with mongo)
    const ExistingUser = User.findOne({ $or: [{ email },{ username }] });
    if(ExistingUser){
        throw new ApiError(400, "User Already Exists");
    }
    
    // avatar - upload and url get.
    console.log("Request File ",req.files);
    
    const avatarLocal = req.files?.avatar[0]?.path; //.files MULTER ka middleware deta hai, avatar is the name there.
    const coverImageLocal = req.files?.coverImage[0]?.path

    if(!avatarLocal){
        throw new ApiError(400, "Avatar is Required");
    }

    const avatarUploaded = await uploadFile(avatarLocal);
    const coverUploaded = await uploadFile(coverImageLocal);

    if(avatarUploaded){
        throw new ApiError(400, "Avatar Required");
    }

    // create db entry
    const userdb = await User.create({
        fullName,
        avatar:avatarUploaded.url,
        coverImage: coverUploaded?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // console.log(userdb)
    // remove password & token and send all data to frontend
    const userCreated = await User.findById(userdb._id).select(
        "-password -refreshToken"
    )
    // check for user creation
    if(!userCreated){
        throw new ApiError(500, "Can't Process the user in our database");
    }
    
    // return resp 
    return res.status(201).json(
        new ApiResponse(200, userCreated, "User Registered Successfully")
    )
    
})

const testUser = asyncHandler(async(req,res) => {
    
    res.send("Ok Testing Workis");
} )

export {registerUser, testUser};