import express, { urlencoded } from 'express'
import dotenv  from 'dotenv'
import cors  from 'cors'
import cookieParser from "cookie-parser";
import userRouter  from './src/routes/user.routes.js'
import connectDB from './src/config/db.js';
import { initCloudinary } from './src/utils/cloudinary.js';

dotenv.config({
    path:'./.env'
})

initCloudinary();

const app= express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({
    limit: "18kb"
}))
app.use(urlencoded({
    extended: true,
    limit: "18kb"
}))
app.use(express.static("public"))
app.use(cookieParser())


import dashboardRouter from "./src/routes/dashboard.route.js"

app.use("/api/v1/user",userRouter)
app.use("/api/v1/user",dashboardRouter)


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
   console.log(`mongodb connection failed !!!`,err);
})