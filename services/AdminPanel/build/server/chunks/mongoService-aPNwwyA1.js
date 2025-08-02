import mongoose from 'mongoose';

const MONGO_URI = "mongodb://mongodb:27017/tbpv6";
let isConnected = false;
async function connectMongoDB() {
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
function getMongoCollection(collectionName) {
  if (!isConnected || mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB connection not established. Call connectMongoDB() first.");
  }
  return mongoose.connection.db.collection(collectionName);
}

export { connectMongoDB as c, getMongoCollection as g };
//# sourceMappingURL=mongoService-aPNwwyA1.js.map
