import express from 'express';
import { addPersonValidation } from '../validation/personValidator'; // Import reguł walidacji
import { addPerson } from '../controllers/personController'; // Import funkcji kontrolera

const router = express.Router();

// Definiowanie trasy do dodawania nowej osoby z walidacją
router.post('/add', addPersonValidation, addPerson);

export default router;
