import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const DBInstance = await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`);
        console.log(DBInstance);
        console.log(`MongoDB Connected !, Host is : `, DBInstance.connection.host);
    } 
    catch (error) {
        console.log("Database Connection Error",error);
        process.exit(1);
    }
}

export default connectDB