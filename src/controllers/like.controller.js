import mongoose, {isValidObjectId} from "mongoose"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandeler } from "../utils/asyncHandeler.js"
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandeler(async (req, res) => {
    // toggle like on video
    const {videoId} = req.params
    const {isLiked}= req.body
    if(!videoId){
        throw new ApiError(400,"video id is invalid")
    }
    if(!isLiked){
        throw new ApiError(400,"provide the like status")
    }
    const likedVideo =await Like.create({
           isLiked,
           video:videoId,
           likedBy:req.user?._id
    })

    if(!likedVideo){
        throw new ApiError(500,"internal server error")
    }

    res.status(200)
       .json(new ApiResponse(200,likedVideo,"like updated"))
})

const toggleCommentLike = asyncHandeler(async (req, res) => {
    // toggle like on comment
    const {commentId} = req.params
    const {isLiked}= req.body
     if(!commentId){
        throw new ApiError(400,"Comment id is invalid")
    }
    if(!isLiked){
        throw new ApiError(400,"provide the like status")
    }

     const likedComment =await Like.create({
           isLiked,
           comment:commentId,
           likedBy:req.user?._id
    })

    if(!likedComment){
        throw new ApiError(500,"internal server error")
    }

    res.status(200)
       .json(new ApiResponse(200,likedComment,"like updated"))

})

const toggleTweetLike = asyncHandeler(async (req, res) => {
    // toggle like on tweet
    const {tweetId} = req.params
    const {isLiked}= req.body
     if(!tweetId){
        throw new ApiError(400,"tweet id is invalid")
    }
    if(!isLiked){
        throw new ApiError(400,"provide the like status")
    }

     const likedTweet =await Like.create({
           isLiked,
           tweet:tweetId,
           likedBy:req.user?._id
    })

    if(!likedTweet){
        throw new ApiError(500,"internal server error")
    }

    res.status(200)
       .json(new ApiResponse(200,likedTweet,"like updated"))

}
)

const getLikedVideos = asyncHandeler(async (req, res) => {
    // get all liked videos

    const likedVideos =await Like.find({
        likedBy:req.user?._id,
        isLiked:true
    })

    res.status(200)
       .json(new ApiResponse(200,likedVideos,"video fetched succesfully"))
    
}) 
 
export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}