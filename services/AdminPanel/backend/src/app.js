import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import apiRouter from './routes/api/index.js';
import errorHandler from './utils/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(UPLOAD_DIR));

connectDB();
connectRedis();

app.use('/api', apiRouter);

app.use(errorHandler);

export default app;
