import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import {asynchandeler} from "../utils/asyncHandeler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asynchandeler(async(req,_,next)=>{
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