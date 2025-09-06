import mongoose from 'mongoose';

function connectToDb() {
  mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.log("❌ MongoDB connection error:", err));
}


export default connectToDb;