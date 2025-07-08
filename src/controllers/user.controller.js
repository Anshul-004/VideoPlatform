import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {User} from '../models/user.model.js'
import {uploadFile} from '../utils/fileUpload.js'
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async(userId) => {
    try {
        // console.log(userId)
        const user = await User.findById(userId);
        // console.log(user) WORKS
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefereshToken();
        // console.log(accessToken,refreshToken)
        //put refresh token in db
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken,refreshToken}

    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Something went wrong while generating refresh & Access tokens")
    }
}

const registerUser = asyncHandler( async (req,res) => {
    
    //Get data from frontend
    const {fullName, email, username, password} = req.body;
    // console.log(fullName, email, username, password);
    // console.log(req);
    //vaildate it
    if([fullName, email, username, password].some((field) => {field?.trim() === ""}))
        {    
            throw new ApiError(400, "All Fields Required")//NAYA OBJECT BANAYA USS CLASS KA
        } 
    
    // check if user exists
    // IMPORT User Model (As it can communicate directly with mongo)
    const ExistingUser = await User.findOne({ $or: [{ email },{ username }] });
    // console.log("EXISTING USER LOG",ExistingUser)
    if(ExistingUser){
        throw new ApiError(400, "User Already Exists");
    }
    
    // avatar - upload and url get.
    
    const avatarLocal = req.files?.avatar[0]?.path; //.files MULTER ka middleware deta hai, avatar is the name there.
    console.log(req.files)
    let coverImageLocal;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        // console.log("IN IF FOR COVER IMAGE")
        coverImageLocal = req.files.coverImage[0].path
        // console.log(coverImageLocal)
    }

    if(!avatarLocal){
        throw new ApiError(400, "Avatar is Required");
    }

    const avatarUploaded = await uploadFile(avatarLocal);
    const coverUploaded = await uploadFile(coverImageLocal);
    
    if(!avatarUploaded){
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

const loginUser = asyncHandler( async (req, res) => {
    //Get data from frontend (req.body -> email / username, password)
    //check if the email/ user -> valid
    //compare the passwd , if T -> LOG IN, F -> RESET FIELD, RED ERROR MSG.
    //ACCESS & REFERESH TOKEN
    //SEND COOKIE
    // return resp
    // console.log(req.body)
    const {email,username, password} = req.body;

    if(!username && !email){
        throw new ApiError(400,"Email OR username is required");
    }
    if(password == "") {
        throw new ApiError(400, "Password required");
    }

    const PossibleUser = await User.findOne({$or:[{username},{email}]});
    
    if(!PossibleUser){
        throw new ApiError(404, "No Such User Exists");
    }
    
    //Checking passwords (Encrypted)
    const passwordCheck = await PossibleUser.isPasswordCorrect(password);
    if(!passwordCheck){
        throw new ApiError(401, "Invalid User Credentials")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(PossibleUser._id);
    //Upadte user, for refresh token field updated
    const LoggedInUser = await User.findById(PossibleUser._id).select("-password -refreshToken");

    //SENDING COOKIE, options goes with cookie
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("AccessToken", accessToken, options)
    .cookie("RefreshToken", refreshToken, options)
    .json(new ApiResponse(200,{user: LoggedInUser, accessToken, refreshToken}), "User Logged In Successfully"); //good practice to send access and refresh tokens.
})

const logOutUser = asyncHandler(async(req,res) => {
    //Clear Cookies.
    const userId = req.user._id;
    const options = {
        httpOnly: true,
        secure: true
    }
    await User.findByIdAndUpdate(userId,
    {
        $set: {refreshToken: undefined},
    },
    {new: true}
    )

    return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("RefreshToken",options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
})

const testUser = asyncHandler(async(req,res) => {
    
    res.send("Ok Testing Workis");
})

const refreshAccessToken = asyncHandler(async(req,res) => {
    //check refresh tokens , one in db & with current user.
    //if same -> generate new sets
    //else relogin

    const userRefresh = req.cookies.refreshToken || req.body.refreshToken;
    if(!userRefresh) throw new ApiError(401, "Unauthorized Request");

    try {
        const decodedUserRefreshToken = jwt.verify(userRefresh,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedUserRefreshToken?._id);
        if(!user) throw new ApiError(401, "Invalid Refresh Token");
    
        //User is the DB Entry , now if the token w/ user is same as token we got _> valid session
        if(userRefresh !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token Invalid or Expired")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
    
        return res
        .status(200)
        .cookie("AccessToken", accessToken, options)
        .cookie("RefreshToken", refreshToken, options)
        .json(new ApiResponse(200,{user, accessToken, refreshToken}), "Access Tokens Refreshed Successfully");
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Token")
    }

})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword, newPassword} = req.body;

    const currUser = await User.findById(req.user?._id)

    const pass = await currUser.isPasswordCorrect(oldPassword)
    if(!pass) throw new ApiError(400, "Wrong Password")

    currUser.password = newPassword

    await currUser.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200,{},"Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current User Fetched Successfully"));
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName, email} = req.body

    if(!fullName || !email) throw new ApiError(401, "Email & FullName required")
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"User Updated Successfully"))
})

const updateAvatar = asyncHandler(async(req,res)=>{
    const avatarLocal = req.file?.path

    if(!avatarLocal) throw new ApiError(400, "Avatar File Missing")

    const avatarUploaded = await uploadFile(avatarLocal)

    if(!avatarUploaded) throw new ApiError(400, "Can't Upload to Cloudinary")

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatarUploaded.url
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user, "Avatar Updated Successfully"))
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverLocal = req.file?.path

    if(!coverLocal) throw new ApiError(400, "CoverImage File Missing")

    const coverUploaded = await uploadFile(coverLocal)

    if(!coverUploaded) throw new ApiError(400, "Can't Upload to Cloudinary")

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverUploaded.url
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user, "CoverImage Updated Successfully"))
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User channel fetched successfully"))
})

export {registerUser, testUser,loginUser,logOutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateAvatar,updateCoverImage,getUserChannelProfile};