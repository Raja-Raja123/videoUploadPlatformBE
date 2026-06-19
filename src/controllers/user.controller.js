import ApiError from '../utils/ApiError.js'
import User from '../models/user.model.js'
import {asynchandeler} from '../utils/asyncHandeler.js'
import ApiResponse from '../utils/ApiResponse.js'
import  uploadOnCloudinary  from '../utils/cloudinary.js'
import jwt from "jsonwebtoken"
import mongoose from 'mongoose'

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

const changeCurrentPassword = asynchandeler(async(req,res)=>{
   const {oldPassword,newPassword} = req.body

   if(!(oldPassword||newPassword)){
      throw new ApiError(401,"all fields are mandatory")
   }

   const user = await User.findById(req.user._id)
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect){
      throw new ApiError(400,"password is incorrect")
   }

   user.password = newPassword;
   await user.save({validateBeforeSave:false})

   return res.status(200)
          .json(new ApiResponse(200,{},"password updated successfully"))
})

const updateAccountDetails = asynchandeler(async(req,res)=>{
    const {fullName,email} = req.body

    if(! (fullName || email)){
       throw new ApiError(400,"all fields are mandetory")
    }
   const user = User.findByIdAndUpdate(req
      .user?._id,
      {
         $set:{
            fullName,email
         }
      },
      {
         new:true
      }
   ).select("-password")

   return res.status(200)
              .json(
               new ApiResponse(200,user,"account details updated successfully")
            )


})
   

const getCurrentUser =  asynchandeler(async(req,res)=>{
   return res
   .status(200)
   .json(
      new ApiResponse(200,req.user,"user fetched successfully")
   )
})


const updateUserAvatar = asynchandeler((req,res)=>{
   const avatarLclPath = req.file?.path

   if(!avatar){
      throw new ApiError(400,"Avatar file is missing")
   }

   // todo:delete old file
   const avatar = await uploadOnCloudinary(avatarLclPath)

   if(!avatar){
      throw new ApiError(400,"Error while uploading avatar")
   }

      const  user = User.findByIdAndUpdate(
         req.user._id,
         {
            $set:{
               avatar: avatar.url 
            }
         },
         {new:true}
      ).select("-password")

      return res.status(200)
                .json(
                  new ApiResponse(200,user,"avatar updated succefully")
                )
})

const updateUserCoverImg = asynchandeler((req,res)=>{
   const coverImgLclPath = req.file?.path

   if(!avatar){
      throw new ApiError(400,"cover image file is missing")
   }

   // todo:delete old file
   const coverImage = await uploadOnCloudinary(coverImgLclPath)

   if(!coverImage){
      throw new ApiError(400,"Error while uploading coverImage")
   }

      const  user = User.findByIdAndUpdate(
         req.user._id,
         {
            $set:{
               avatar: coverImage.url 
            }
         },
         {new:true}
      ).select("-password")

      return res.status(200)
                .json(
                  new ApiResponse(200,user,"coverImage updated succefully")
                )
})

const getUserChannelProfile = asynchandeler(async(req,res)=>{
     const {username} = req.params

     if(!username?.trim()){
       throw new ApiError(400,"username is missing")
     }

    const channel = await User.aggregate([
      {
      $match:{
          username: username?.toLowerCase()
      }
    },
   
    {
      $lookup:{
         from:"subscriptions",
         localField:"_id",
         foreignField:"channel",
         as:"subscribers"
      }
    },

    {
      $lookup:{
           from:"subscriptions",
         localField:"_id",
         foreignField:"subscriber",
         as:"subscriberdTo"
      }
    },
    {
      $addFields:{
         subscribersCount : {
            $size:"$subscribers"
         },
         channelSubscribedToCnt:{
             $size:"$subscriberdTo "
         },
         isSubscribed:{
            $cond:{
               if:{$in:[req.user?._id,"$subscribers.subscriber"]},
               then: true,
               else:false
            }
         }
      }
    },

    {
      $project:{
         fullName:1,
         userName:1,
         subscribersCount:1,
         channelSubscribedToCnt:1,
         isSubscribed:1,
         avatar:1,
         coverImage:1,
         email:1

      }
    }

   ])

   if(!channel?.length){
       throw new ApiError(404,"channel doenot exist")
   }
   console.log(channel);

   return res.status(200)
          .json(
            new ApiResponse(200,channel[0],"user channel fetched succesfully")
          )
})

const getWatchHistory = asynchandeler(async (req,res)=>{

   const user = await User.aggregate([
      {
         $match : {
            _id : new mongoose.Types.ObjectId(req.user._id)
         }
      },
      {
         $lookup:{
            from:"videos",
            localField: "$watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
               {
                  $lookup:{
                      from:"users",
                      localField: "$owner",
                      foreignField:"_id",
                      as:"owner",
                      pipeline:[
                        {
                           $project:{
                              fullName : 1,
                              userName:1,
                              avatar:1
                           }
                        },
                        {
                           $addFields:{
                              owner:{
                                 $first : "$owner"
                              }
                           }
                        }
                      ]
                  }
               }
            ]
         }
      }
   ])
   
   return res.status(200)
             .json(
               new ApiResponse(200,user[0].watchHistory,"watch hitory fetched succesfully")
             )

})
//***imp */ while we selecting _id it gives us a string which is not a mongodb actual complete id  as we use mongoose  it adds the string to  objectid("") but the actual id in mongoDB includes objectid("") also.

export {registerUser,login,logout,refreshAccesssToken,changeCurrentPassword,updateAccountDetails,getCurrentUser,updateUserAvatar,updateUserCoverImg,getUserChannelProfile,getWatchHistory};
 