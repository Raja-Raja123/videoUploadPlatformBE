import mongoose, { Schema } from 'mongoose'
import mongooesAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const commentSchema =  new Schema({
    content:{
        type:String,
        required:true
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})


commentSchema.plugin(mongooesAggregatePaginate)
 const Comment = mongoose.model("Comment",commentSchema)

 export default Comment;