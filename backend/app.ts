import express, { Application } from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from 'dotenv';

import connectDB from './src/config/database';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;
const MONGOURL = process.env.MONGOURL;

app.use(cors());

app.use(bodyParser.json());

connectDB(MONGOURL);

app.listen(port, () => {
  console.log(`Serwer uruchomiony na porcie ${port}`);
});
