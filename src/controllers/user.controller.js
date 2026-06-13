import ApiError from '../utils/ApiError.js'
import User from '../models/user.model.js'
import {asynchandeler} from '../utils/asyncHandeler.js'
import ApiResponse from '../utils/ApiResponse.js'
import  uploadOnCloudinary  from '../utils/cloudinary.js'

export const registerUser = asynchandeler(async(req,res)=>{

    // steps to register a user 
    
    // get user details  from front end
    //check for  validation : e.g. not empty
    // check if user already exists : username, email
    // check for  images and avatar
    // upload it to cloudinary
    // check  for cloudinary upload is succesful or not 
    // create user object : create entry in db
    // remove password and refresh token  field from  response
    // check for user creation 
    // return  res

     const {fullName,email,password,username} = req.body

     if([fullName,email,password,username].some((field)=>field.trim() === ""))
      {
        throw new ApiError(400, "fullname is required")
     }

  const existedUser = await  User.findOne({
   $or:[{username},{email}]
  })

  if(existedUser){ 
   throw new ApiError(409,"user with email and username already exist")
  }

 const avatarLocalPath = req.files?.avatar[0]?.path
 let coverImgLocalPath; 
 if(coverImgLocalPath){
   coverImgLocalPath = req.files?.coverImage[0]?.path
 } 
//   console.log(req.files) 
   

 if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
 }

 const avatar = await uploadOnCloudinary(avatarLocalPath)
 const coverImage = await uploadOnCloudinary(coverImgLocalPath) || ""


if(!avatar){
   throw new ApiError(400,"Avatar file is required")
}


  const user = await User.create({
   fullName,
   avatar: avatar.url,
   coverImage: coverImage.url || "",
   email,
   password,
   username:username.toLowerCase()
})

const createdUser = await User.findById(user._id).select(
   "-password -refreshToken"
)

if(!createdUser){
   throw new ApiError(500,"something went wrong while registering a user")
}

return res.status(200).json(
new ApiResponse(200,createdUser,"user created succesfully"))

})


