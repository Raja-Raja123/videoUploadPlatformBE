import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        
     const dbInstance = await mongoose.connect(process.env.MONGODB_URI)
     console.log(`mongodb connected !! DB host ${dbInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection failed ",error)
    }
}

export default connectDB;