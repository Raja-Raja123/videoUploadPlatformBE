import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs';
import path from 'path';

  export const initCloudinary = ()=>{
  
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

 console.log("Cloudinary Config:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing",
    api_key: process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing"
  });

}


const uploadOnCloudinary = async (localFilePath) => {
        console.log("localFilePath out side try block:",localFilePath)

  try {
        console.log("localFilePath try block:",localFilePath)
        const absolutePath = path.resolve(localFilePath)

    if(!localFilePath){
        console.log("localFilePath if:",absolutePath)
           return null;
          }
        // upload file to cloudinary
        const response = await cloudinary.uploader.upload(absolutePath,{
            resource_type:'auto'
        })
        // file upload succesful
        console.log("file is uploaded on cloudinary",response,response.url)
        return response
      } catch (error) {
       console.error("❌ CLOUDINARY UPLOAD ERROR:", {
      message: error.message,
      status: error.status,
      http_code: error.http_code,
      fullError: error
    })
        // fs.unlinkSync(localFilePath) //remove failed upload files
        return null ;
      }
}

export default uploadOnCloudinary;