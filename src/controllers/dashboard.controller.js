import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import User from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

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
          $group:{
            _id: "$videos",
            totalView:{$sum:"$views"}
          }
        },{
            $addFields:{
                totalVideos:{
                    $size : "$videos"
                },
                $totalLikes:{
                    $size : "$likes"

                },
                  $totalSubscribers:{
                    $size : "$subscribers"

                }
            }
        }
      ])

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
      const {username} = req.params
      
})

export {
    getChannelStats, 
    getChannelVideos
    }