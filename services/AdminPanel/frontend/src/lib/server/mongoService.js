import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://mongodb:27017/tbpv6'; 

let isConnected = false;

// Определение схемы и модели для администратора
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

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

export { Admin };
export default mongoose;