import mongoose, { Schema } from 'mongoose'
import mongooesAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const videoSchema = new Schema({
  videoFile:{
            type:String,
            required:true
  },
  thumbnail:{
    type:String,
    required:true,
  },
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
  },
  titel:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  duration:{
    type:Number,
    required:true
  },
  views:{
    type:Number,
    default:0
  },
  isPublished:{
    type:Boolean,
    default:true
  }
},
{timestamps:true})

videoSchema.plugin(mongooesAggregatePaginate)
const  Video = mongoose.model("Video",videoSchema) 

export default Video;
