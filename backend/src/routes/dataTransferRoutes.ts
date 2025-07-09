import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../Middleware/authenticateToken';
import {
    importJson,
    importExel,
    importCsv,
    exportJson,
    exportExel,
    exportCsv
} from '../controllers/dataTransferController';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

router.post('/import/json', upload.single('file'), importJson);
router.post('/import/excel', upload.single('file'), importExel);
router.post('/import/csv', upload.single('file'), importCsv);

router.get('/export/json', exportJson);
router.get('/export/excel', exportExel);
router.get('/export/csv', exportCsv);

export default router;
