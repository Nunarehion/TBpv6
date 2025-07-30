import express from 'express';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const router = express.Router();


router.get('/:collectionName', async (req, res) => {
  const { collectionName } = req.params;
  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const documents = await collection.find({}).sort({ _id: -1 }).toArray();
    res.json(documents);
  } catch (err) {
    console.error(`Error fetching documents from ${collectionName}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/schema/:collectionName', async (req, res) => {
  const { collectionName } = req.params;
  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const sampleDocs = await collection.find().limit(100).toArray();
    const keys = new Set();
    sampleDocs.forEach(doc => {
      Object.keys(doc).forEach(key => {
        if (key !== '_id') keys.add(key);
      });
    });
    res.json(Array.from(keys));
  } catch (e) {
    console.error('Ошибка при получении схемы:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/:collectionName/:id', async (req, res) => {
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


router.delete('/:collectionName/:id', async (req, res) => {
  const { collectionName, id } = req.params;

  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(`Ошибка при удалении из ${collectionName}:`, err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

router.post('/:collectionName', async (req, res) => {
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


export default router;