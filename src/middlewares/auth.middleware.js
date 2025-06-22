import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler( async (req,res,next) => {
    //Cookies can be accessed., due to cookie-parser we initialized in app.js

    try {
        const actk = req.cookies?.AccessToken || req.header("Autorization")?.replace("Bearer ", "") //req.header() for mobile apps,
        // const rftk = req.cookies?.RefreshToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!actk){
            throw new ApiError(401, "Unauthorized Request");
        }
    
        //check if token is valid
        const decodedToken = jwt.verify(actk, process.env.ACCESS_TOKEN_SECRET);
        const userFind = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!userFind){
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = userFind;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})