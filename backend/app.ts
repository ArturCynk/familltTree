import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import http from 'http';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import connectDB from './src/config/database';
import FamilyTree from './src/models/FamilyTree';
import personRoutes from './src/routes/personRoutes';
import authRoutes from './src/routes/authRoutes';
import familyTreeRoutes from './src/routes/familyTree';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
const MONGOURL = process.env.MONGOURL;


connectDB(MONGOURL);

// Multer setup for file uploads
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

// WebSocket handling
wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type !== 'auth' || !data.token || !data.familyTreeId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Nieprawidłowe dane autentykacyjne' }));
        ws.close();
        return;
      }

      const decoded = jwt.verify(data.token, process.env.JWT_SECRET as string) as { userId: string };
      const tree = await FamilyTree.findById(data.familyTreeId);

      if (!tree) {
        ws.send(JSON.stringify({ type: 'error', message: 'Drzewo nie istnieje' }));
        ws.close();
        return;
      }

      const isMember = tree.members.some(m => m.user.toString() === decoded.userId) || tree.owner.toString() === decoded.userId;
      
      if (!isMember) {
        ws.send(JSON.stringify({ type: 'error', message: 'Brak dostępu' }));
        ws.close();
        return;
      }

      ws.send(JSON.stringify({ type: 'familyTreeData', data: tree }));
      
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Autentykacja nieudana' }));
      ws.close();
    }
  });
});

server.listen(port, () => {
  console.log('Serwer działa na porcie 3000');
});