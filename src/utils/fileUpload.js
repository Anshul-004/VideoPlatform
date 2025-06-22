import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

import dotenv from "dotenv";
dotenv.config({path:'./.env'});

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadFile = async (localFilePath) => {
    try {
        
        if(!localFilePath) return null;
        //upload file to cloudinary
        const resp = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // console.log(resp.format);
        console.log("File uploaded to Cloudinary successfully", resp.url);
        fs.unlink(localFilePath);
        return resp;
    } catch (error) {
        fs.unlinkSync(localFilePath); // Delete the file if upload fails
        console.error("Error uploading file to Cloudinary:", error);
        return null;
    }
}

export { uploadFile };