import mongoose, { Schema } from 'mongoose'
 
const likeSchema = new Schema({
    isLiked:{
        type: Boolean,
        require:true
    },
    comment:{
       type: Schema.Types.ObjectId,
        ref:"Comment"
    },
    video:{
        type: Schema.Types.ObjectId,
        ref:"Video"
    },
    tweet:{
        type: Schema.Types.ObjectId,
        ref:"Tweet"
    },
    likedBy:{
        type: Schema.Types.ObjectId,
        ref:"User",
        require:true
    }
},{timestamps:true})

export const Like = mongoose.model("Like",likeSchema)