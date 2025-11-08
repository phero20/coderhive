import mongoose from "mongoose";

const DEFAULT_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coderhive";

export async function connectDB(uri = DEFAULT_URI) {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error", err);
    throw err;
  }
}

export default connectDB;
