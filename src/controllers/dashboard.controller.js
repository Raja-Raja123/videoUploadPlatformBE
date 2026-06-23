import mongoose from "mongoose"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import User from "../models/user.model.js"
import { asyncHandeler } from "../utils/asyncHandeler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import Video from "../models/video.model.js"

const getChannelStats = asyncHandeler(async (req, res) => {
    //  Get the channel stats like total video views, total subscribers, total videos, total likes etc.

      const user = await User.findById(req.user._id)

      if(!user){
        throw new ApiError(401,"invalid user!")
      }

      const channelStats = await User.aggregate([
        {
            $match:{
                _id:user?._id
            }
        }, 
        { 
            $lookup:{
                from : "videos",
                localField :"_id",
                foreignField:"owner",
                as: "videos"
            }      
        },
        { 
            $lookup:{
                from:"likes",
                localField :"_id",
                foreignField:"likedBy",
                as: "likes"
            }
        },
        {
            $lookup:{
                 from: "subscriptions",
                 localField: "_id",
                 foreignField: "channel",
                 as: "subscribers",
            }
        },
        {
            $addFields:{
                totalView:{$sum:"$videos.views"},
                totalVideos:{
                    $size : { $ifNull: [ "$videos", [] ] } 
                },
                totalLikes:{
                    $size : { $ifNull: [ "$likes", [] ] }

                },
                  totalSubscribers:{
                    $size : { $ifNull: [ "$subscribers", [] ] }

                }
            }
        },{
            $project:{
                _id :1,
                username:1,
                fullName:1,
                videos:1,
                likes:1,
                subscribers:1,
                totalView:1,
                totalVideos:1,
                totalLikes:1,
                totalSubscribers:1
            }
        }
      ])

      return res.status(200)
                .json(
                    new ApiResponse(200,channelStats,"channel stats fetch succesfully")
                )

})

const getChannelVideos = asyncHandeler(async (req, res) => {
    // Get all the videos uploaded by the channel
       const getAllVideos =await  Video.aggregate([
       { 
        $match:{
             owner:new mongoose.Types.ObjectId(req.user._id),
             isPublished : true 
        }
    }
       ])
       
       return res.status(200)
                .json(
                    new ApiResponse(200,getAllVideos,"video fetched successfully")
                )
})

export {
    getChannelStats, 
    getChannelVideos
    }