import express, { Application } from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import personRoutes from './src/routes/personRoutes'; // Importowanie trasy
import authRoutes from './src/routes/authRoutes'
import connectDB from './src/config/database';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;
const MONGOURL = process.env.MONGOURL;

app.use(cors());

app.use(bodyParser.json());

connectDB(MONGOURL);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Nadajemy unikalną nazwę plikowi, aby nie był nadpisany
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Tworzymy instancję multera z powyższą konfiguracją
const upload = multer({ storage });


// Upewniamy się, że folder 'uploads' istnieje
app.use('/uploads', express.static('uploads'));

app.use('/api/person', personRoutes)
app.use('/api/auth',authRoutes )

app.listen(port, () => {
  console.log(`Serwer uruchomiony na porcie ${port}`);
});
