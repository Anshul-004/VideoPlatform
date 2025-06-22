import { Router } from "express";
import { loginUser, logOutUser, registerUser, testUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// /user + /register route :
// add function before postmethod to act as middleware.
router.route("/register").post(
    upload.fields([{
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }]) //MIDDLEWARE
    ,registerUser)

router.route("/login").post(loginUser)


router.route("/test").get(testUser)

//secured routes
router.route("/logout").post(verifyJWT,logOutUser) //verifyJWT is Middleware


export default router;