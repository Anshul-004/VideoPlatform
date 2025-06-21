import { Router } from "express";
import { registerUser, testUser } from "../controllers/user.controller.js";

const router = Router();

// /user + /register route :
router.route("/register").post(registerUser)
router.route("/test").get(testUser)
// // /user + /login route :
// router.route("/login").post(loginUser)

export default router;