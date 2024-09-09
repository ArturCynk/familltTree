import express from 'express';
import { addPersonValidation, updatePersonValidation } from '../validation/personValidator'; // Import reguł walidacji
import { addPerson, deletePerson, updatePerson } from '../controllers/personController'; // Import funkcji kontrolera

const router = express.Router();

// Definiowanie trasy do dodawania nowej osoby z walidacją
router.post('/add', addPersonValidation, addPerson);

// Definiowanie trasy do aktualizacji osoby z walidacją
router.put('/update/:id', updatePersonValidation, updatePerson);

router.delete('/delete/:id', deletePerson)

export default router;
