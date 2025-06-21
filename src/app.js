import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN
    }
));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true, limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from './routes/user.route.js'

//good practice = /api/v1/route
//routes declaration
app.use("/api/v1/users", userRouter); //goes to userRoutes in Routes., now if i want user to login, ill redirect to /users, then check cookie and do /user/login or /user/register

export {app};