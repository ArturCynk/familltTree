import mongoose from "mongoose";

const connectDB = async (mongoURI?: string) => {
    try {
        if(!mongoURI) {
            throw new Error(`MongoUri is not provided`);
        }

        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB connection`);
    } catch (err) {
        console.error(`Error connecting to MongoDB`);
    }
}

export default connectDB;