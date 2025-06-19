import dotenv from 'dotenv'
import connectDB from "./db/dbConnect.js";
import { app } from './app.js';

dotenv.config({path:'./.env'})

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("Error Occured in Express App ", error);
        throw error;
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Express App Listening on PORT : ${process.env.PORT}`)
    })
})
.catch( (e) => {
    console.error("DB Connection Error:", e);
    process.exit(1);
});

