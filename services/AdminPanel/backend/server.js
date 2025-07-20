import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { ObjectId } from 'mongodb';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const MONGO_URI = 'mongodb://mongodb:27017/tbpv6';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api/:collectionName', async (req, res) => {
  const { collectionName } = req.params;

  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const documents = await collection.find({}).sort({ created_at: -1 }).toArray();
    res.json(documents);
  } catch (err) {
    console.error(`Error fetching documents from ${collectionName}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const names = collections.map(col => col.name);
    res.json(names);
  } catch (err) {
    console.error('Error listing collections:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.put('/api/:collectionName/:id', async (req, res) => {
  const { collectionName, id } = req.params;
  const updateData = req.body;

  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error(`Error updating document in ${collectionName}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/:collectionName', async (req, res) => {
  const { collectionName } = req.params;
  const newDocument = req.body;

  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const result = await collection.insertOne({
      ...newDocument,
      created_at: new Date()
    });

    res.status(201).json({ success: true, insertedId: result.insertedId });
  } catch (err) {
    console.error(`Error inserting document into ${collectionName}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
