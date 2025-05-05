import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import http from 'http';
import connectDB from './src/config/database';
import personRoutes from './src/routes/personRoutes';
import authRoutes from './src/routes/authRoutes';
import familyTreeRoutes from './src/routes/familyTree';
import { initializeWebSocket } from './src/websocket/websocket';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

initializeWebSocket(server);

app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
const MONGOURL = process.env.MONGOURL;

connectDB(MONGOURL);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));
app.use('/api/person', personRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/family-trees', familyTreeRoutes);


server.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});