import {asyncHandler} from '../utils/asyncHandler.js'

const registerUser = asyncHandler( async (req,res) => {
    res.status(200).json({
        message:"ok"
    } )
})

const testUser = asyncHandler(async(req,res) => {
    
    res.send("Ok Testing Workis");
} )

export {registerUser, testUser};