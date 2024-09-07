import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express()
const corsOption = {
    origin: process.env.CORS_ORIGIN,
    Credential : true
}

app.use(cors(corsOption))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// import routes
import globalErrorHandler from './utils/errorHandler.js';
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js'



// routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)

// global error handler
app.use(globalErrorHandler)




export default app;
// http://localhost:8000/api/v1/users/register