import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs';
import path from 'path';

  export const initCloudinary = ()=>{
  
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


}


const uploadOnCloudinary = async (localFilePath) => {

  try {

    if(!localFilePath){
           return null;
          }
        // upload file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        // file upload succesful
        // console.log("file is uploaded on cloudinary",response,response.url)
         fs.unlinkSync(localFilePath) //remove local files

        return response
      } catch (error) {
       console.error("❌ CLOUDINARY UPLOAD ERROR:", {
      message: error.message,
    })
         fs.unlinkSync(localFilePath) //remove failed upload files
        return null ;
      }
}


export const deleteFromCloudinary = async (localFilePath) => {

  try {

    if(!localFilePath){
           return null;
          }
        // delete file from cloudinary
       const deletedFile =  await cloudinary.uploader.destroy(localFilePath,{
            resource_type:'image'
        })
        console.log("old file deleted")
       
      } catch (error) {
       console.error("❌ CLOUDINARY DELETION ERROR:", {
      message: error.message,
    })
        return null ;
      }
}


export default uploadOnCloudinary;