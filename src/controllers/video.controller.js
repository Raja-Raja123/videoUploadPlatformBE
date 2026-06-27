import mongoose, {isValidObjectId} from "mongoose"
import Video from "../models/video.model.js"
import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandeler } from "../utils/asyncHandeler.js";
import uploadOnCloudinary, { deleteFromCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandeler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    // get all videos based on query, sort, pagination 
    const user = req.user
    if(!user){
        throw new ApiError(400,"user not found")
    }

    const pipeline = []

     if(query?.trim()) {
        pipeline.push({
            $match:{
                title:query 
            }
        })
     }  

     pipeline.push( {
            $skip: (page-1)*limit
         },{
            $limit: limit 
         } 
        )
     if(sortBy){
        pipeline.push({
            $sort:{createdAt:-1}
        })
     }   
        
   const videos = await Video.aggregate(pipeline) 

   return res.status(200)
             .json( new ApiResponse(200,videos,"video fetched succesfully"))

})
const publishAVideo = asyncHandeler(async (req, res) => {

    // get video, upload to cloudinary, create video
    const owner = req.user;
    if(!owner){
        throw new ApiError(400,"user not found")
    }
    const { titel, description} = req.body
    if(!titel || !description){
       throw new ApiError(400,"titel and decription is required")
    }
    const videofile =req.files?.videofile[0].path;
    const thumbnail =req.files?.thumbnail[0].path;
    if(!videofile || !thumbnail){
         throw new ApiError(400,"fill all the required field")
    }

    const videoUrl = await uploadOnCloudinary(videofile)
    const thumbnailUrl = await uploadOnCloudinary(thumbnail)

    if(!(videoUrl || thumbnailUrl )){
        throw new ApiError(500,"internal server error")
    }

    const video = await Video.create({
        
        videofile:videoUrl.url,
        thumbnail:thumbnailUrl.url,
        owner,
        titel,
        description,
        duration:videoUrl.duration

    })

    if(!video){
            throw new ApiError(500, "something went wrong while uploading a video");      
    }

    return res.status(200)
    .json(new ApiResponse(200,video,"video uploaded succesfully"));
})

const getVideoById = asyncHandeler(async (req, res) => {
    const { videoId } = req.params
    // get video by id
    if(!videoId){
        throw new ApiError(400,"video not found")
    }

    const video = await Video.findById(videoId).select(" -isPublished")

    if(!video){
        throw new ApiError(400,"video not found")
    }

    return res.status(200)
            .json(new ApiResponse(200,video,"video fetched succesfully"))
})

const updateVideo = asyncHandeler(async (req, res) => {
    const { videoId } = req.params
    // update video details like title, description, thumbnail
    if(!videoId){
        throw new ApiError(400,"please provide a valid id")
    }
    const {titel,description} = req.body
    if(!(titel || description)){
        throw new ApiError(400," titel and description are required")
    }
    const thumbnail = req.file?.path
    const oldThumbnail = await Video.findById(videoId);
    if(!thumbnail){
        throw new ApiError(400,"all fields are required")
    }
    const newThumbnail = await uploadOnCloudinary(thumbnail)
    if(!newThumbnail){
        throw new ApiError(500,"internal server error")
    }

   await deleteFromCloudinary(oldThumbnail.thumbnail)
   const updatedData =   await Video.findByIdAndUpdate(
        videoId,
        {
           thumbnail:newThumbnail.url,
           titel,
           description

        },
        {
            new:true,
            runValidators:false
        }
      ).select(" -isPublished -owner")

      return res.status(200)
                .json( new ApiResponse(200,updatedData,"video detail updated succesfully"))

})

const deleteVideo = asyncHandeler(async (req, res) => {
    const { videoId } = req.params
    // delete video
    if(!videoId){
        throw new ApiError(400,"provided id i invalid")
    }

   const deletedVideo= await Video.findByIdAndDelete(videoId)
   if(!deleteVideo){
       throw new ApiError(400,"video not")
   }

   return res.status(200)
             .json(new ApiResponse(200,{},"video deleted succefully"))

})

const togglePublishStatus = asyncHandeler(async (req, res) => {
    const { videoId } = req.params
}) 

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo, 
    deleteVideo,
    togglePublishStatus
}