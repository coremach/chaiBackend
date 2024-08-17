import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n MongoDb connected successfully\n DB name : ${connectionInstance.connection.name}`);
    } catch (error) {
        console.log(`Database connection Error : ${error}`);
        process.exit(1)
    }
};
export default connectDB;


