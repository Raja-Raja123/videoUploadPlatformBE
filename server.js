import { connectDB } from "../01_basic/config/db.js";
import express, { urlencoded } from 'express'
import dotenv  from 'dotenv'
import cors  from 'cors'
import cookieParser from "cookie-parser";
dotenv.config({
    path:'./.env'
})

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
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
   console.log(`mongodb connection failed !!!`,err);
})