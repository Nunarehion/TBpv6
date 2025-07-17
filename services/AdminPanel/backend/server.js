import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import User from './models/user.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const MONGO_URI = 'mongodb://localhost:27017/adminpanel';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
