import mongoose from "mongoose"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandeler } from "../utils/asyncHandeler.js"
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js";

const getVideoComments = asyncHandeler(async (req, res) => {
    // get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new ApiError(400,"provide a valid video id")
    }

    const comment = await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },{
            $skip: (page-1)*limit
         },{
            $limit: limit 
         } 
    ])
     
    res.status(200)
       .json(new ApiResponse(200,comment,"comment fetched succesfully"))
    
})

const addComment = asyncHandeler(async (req, res) => {
    // add a comment to a video
        const {videoId} = req.params
        const {content} = req.body
        if(!videoId){
            throw new ApiError(400,"video not found")
        }
        if(!content.trim()){
            throw new ApiError(400,"content is required")
        }

        const comment = await Comment.create({
              content,
              video:videoId,
              owner:req.user?._id
        })

        if(!comment){
             throw new ApiError(500,"internal server error")
        }
 
        return res.status(200)
                .json(new ApiResponse(200,comment,"commented succesfully"))
})

const updateComment = asyncHandeler(async (req, res) => {
    // update a comment
    const {commentId}  = req.params
    const {content}   =req.body
    if(!commentId){
        throw new ApiError(400,"provide a valid id")
    }
    if(!content){
        throw new ApiError(400,"content field is require")
    }
     const updatedComment= await Comment.findByIdAndUpdate(
        commentId,
        {
            content
        },
        {
            new:true,
            runValidators:false
        }
     )
     if(!updatedComment){
        throw new ApiError(500,"internal server error")
     }

     return res.status(200)
               .json(new ApiResponse(200,updatedComment,"comment updated"))
})

const deleteComment = asyncHandeler(async (req, res) => {
    //  delete a comment
    const {commentId}  = req.params
    if(!commentId){
        throw new ApiError(400,"provide a valid id")
    }
   const deletedComment = await Comment.findByIdAndDelete(commentId)
   if(!deletedComment){
    throw new ApiError(500,"internal server error")
   }

   res.status(200)
      .json(new ApiResponse(200,{},"comment deleted succesfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }