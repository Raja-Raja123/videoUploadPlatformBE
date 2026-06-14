import User from "../models/user.model";
import ApiError from "../utils/ApiError";
import asyncHandeler from "../utils/asyncHandeler";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandeler((req,res,next)=>{
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

        if(!token){
             throw new ApiError(401,"unauthorized Request")
        }

       const verifiedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

       const user = await  User.findById(verifiedToken._id).select("-password -refreshToken") 

       if(!user){
          throw new ApiError(401,"invalid access token")
       }
        
       req.user = user;
       next();

    } catch (error) {
        throw new ApiError(401,error?.message ||"invalid acces token")
    }
})

export default verifyJWT;