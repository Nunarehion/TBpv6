import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://mongodb:27017/tbpv6';

export const connectDB = () => {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
};

export const getCollection = (collectionName) => {
  return mongoose.connection.db.collection(collectionName);
};

export default mongoose;