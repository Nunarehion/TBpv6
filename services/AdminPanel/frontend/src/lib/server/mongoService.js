import mongoose from 'mongoose';

// Если "mongodb:27017" не работает, попробуйте "127.0.0.1:27017" или IP-адрес вашего сервера MongoDB.
const MONGO_URI = 'mongodb://mongodb:27017/tbpv6'; 

let isConnected = false;

export async function connectMongoDB() {
    if (isConnected) {
        return;
    }
    try {
        await mongoose.connect(MONGO_URI);
        isConnected = true;
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

export function getMongoCollection(collectionName) {
    if (!isConnected || mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB connection not established. Call connectMongoDB() first.');
    }
    return mongoose.connection.db.collection(collectionName);
}

export default mongoose;