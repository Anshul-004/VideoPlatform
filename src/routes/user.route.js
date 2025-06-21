import { Router } from "express";
import { registerUser, testUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
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
router.route("/test").get(testUser)
// // /user + /login route :
// router.route("/login").post(loginUser)

export default router;