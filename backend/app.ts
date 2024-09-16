import express, { Application } from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
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

app.use('/api/person', personRoutes)
app.use('/api/auth',authRoutes )

app.listen(port, () => {
  console.log(`Serwer uruchomiony na porcie ${port}`);
});
