import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {User} from '../models/user.model.js'
import {uploadFile} from '../utils/fileUpload.js'

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefereshToken();

        //put refresh token in db
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh & Access tokens")
    }
}

const registerUser = asyncHandler( async (req,res) => {
    
    //Get data from frontend
    const {fullName, email, username, password} = req.body;
    // console.log(fullName, email, username, password);
    
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
    
    let coverImageLocal;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocal = req.files.coverImage[0].path
    }

    if(!avatarLocal){
        throw new ApiError(400, "Avatar is Required");
    }

    const avatarUploaded = await uploadFile(avatarLocal);
    const coverUploaded = await uploadFile(coverImageLocal);
    // console.log(avatarUploaded);
    // console.log(coverUploaded);
    
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

    const {email,username, password} = req.body;

    if(username=="" || email==""){
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
} )

export {registerUser, testUser,loginUser,logOutUser};