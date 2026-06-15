import ApiError from '../utils/ApiError.js'
import User from '../models/user.model.js'
import {asynchandeler} from '../utils/asyncHandeler.js'
import ApiResponse from '../utils/ApiResponse.js'
import  uploadOnCloudinary  from '../utils/cloudinary.js'
import jwt from "jsonwebtoken"

const generateAccessTokenAndRefreshToken = async (userId)=>{

   try {
       const user = await User.findById(userId);

       const accessToken =await  user.generateAccessToken()
       const refreshToken =await  user.generateRefreshToken()

       user.refreshToken = refreshToken;
       await user.save({validateBeforeSave : false})
       return {accessToken,refreshToken}

   } catch (error) {
       throw new ApiError(500,"something went wrong while generating access and refresh token")
   }
}


 const registerUser = asynchandeler(async(req,res)=>{

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


const login = asynchandeler(async (req,res)=>{
   // take data from req
   // username or email
   // find the user 
   // check password
   // generate acces and refresh token 
   // send cookie

   const {username,email,password} = req.body

   if(!(username || email)){
         throw new ApiError(400,"username or email is invalid!")
   }

   const user = await User.findOne({$or:[
       {username},{email}
   ]})

   if(!user){
         throw new ApiError(404,"user doesnot exist!")   

   }
 
   const isPasswordValid = await user.isPasswordCorrect(password)

   if(!isPasswordValid)
   {
         throw new ApiError(404,"password is invalid")   

   }

     const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

     const options = {
      httpOnly: true,
      secure: true
     }

     return res.status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
      new ApiResponse(
         200,
         {
            user:loggedInUser,
            accessToken,
            refreshToken
         },
         "user logged in succesfully"
      )
     )
  
})

const logout = asynchandeler( async (req,res)=>{
 
     
      await User.findByIdAndUpdate(req.user._id,{
         $unset:{
            refreshToken:1
         }
      },
         {
            new:true
         })

          const options = {
      httpOnly: true,
      secure: true
     }

    return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(
      new ApiResponse(200,{},"user logged out!")
     )

})

const refreshAccesssToken = asynchandeler(async (req,res)=>{
     try {

         const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

         if(!incomingRefreshToken){
            throw new ApiError(401,"unauthoried request")
         }

         const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
         const user = await User.findById(decodedToken?._id)

         if(!user){
            throw new ApiError(401,"invalid refresh token")
         }

         if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used")
         }

         const {accessToken,refreshToken:newRefreshToken} =await generateAccessTokenAndRefreshToken(user._id)
         
         const option = {
            httpOnly: true,
            secure:true
         }

         res.status(200)
         .cookie("refreshToken",newRefreshToken,option)
         .cookie("accessToken",accessToken,option)
         .json(
            new ApiResponse(
               200,
               {accessToken,refreshToken:newRefreshToken},
               "access token refreshed successfully"
            )
         ) 
 
     }  
     catch (error) {
       throw new ApiError(400,error?.message ||"invalid refreh token")
     }
})

export {registerUser,login,logout,refreshAccesssToken};
 