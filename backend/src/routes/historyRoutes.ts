import express from 'express';
import HistoryController from '../controllers/historyController';
import { authenticateToken } from '../Middleware/authenticateToken';

const router = express.Router();

// Middleware autoryzacji dla wszystkich endpointów
router.use(authenticateToken);

// GET /history - Pobierz historię zmian
router.get('/', HistoryController.getHistory);

// GET /history/export - Eksport historii zmian do pliku CSV
router.get('/export', HistoryController.exportHistoryToExcel);

// POST /history/undo/:logId - Cofnij zmianę
router.post('/undo/:logId', HistoryController.undoChange);


router.get('/simulate-undo-update/:logId', HistoryController.simulateUndoUpdate);

router.get('/simulate-undo-create/:logId', HistoryController.simulateUndoCreate);

router.get('/simulate-undo-delete/:logId', HistoryController.simulateUndoDelete);

router.get('/simulate-undo-add-relation/:logId', HistoryController.simulateUndoAddRelation);

router.get('/simulate-undo-remove-relation/:logId', HistoryController.simulateUndoRemoveRelation);


// // POST /history/restore/:logId - Przywróć wersję
// router.post('/restore/:logId', HistoryController.restoreVersion);

export default router;