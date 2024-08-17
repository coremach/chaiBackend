import connectDB from './db/index.js';
import dotenv from 'dotenv';
import app from './app.js'
dotenv.config({
    path: './env'
})

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(` App is listening  on PORT : ${process.env.PORT}`);
        })
    })
    .catch(err => {
        console.log(" Mongo db connection failed !!! ", err);
    })

// Connection with Database and express server
// import mongoose from 'mongoose';
// import { DB_NAME } from './constants.js';
// import express from 'express';
// const app = express();
// ; (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error", (error) => {
//             console.log("Error ", error);
//             throw error;
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on ${process.env.PORT}\nDatabase successfully connected !!!`);
//         })
//     }
//     catch (err) {
//         console.error("Database Connection Error : ", err)
//         throw err;
//     }

// })
// // ();