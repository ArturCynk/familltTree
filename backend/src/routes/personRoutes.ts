import express from 'express';
import { addPersonValidation, updatePersonValidation } from '../validation/personValidator'; // Import reguł walidacji
import { addPerson, deletePerson, getPersonCount, updatePerson, getAllUsers, getUser, addPersonWithRelationships } from '../controllers/personController'; // Import funkcji kontrolera

const router = express.Router();

// Definiowanie trasy do dodawania nowej osoby z walidacją
router.post('/add', addPersonValidation, addPerson);

// Definiowanie trasy do aktualizacji osoby z walidacją
router.put('/update/:id',  updatePerson);
// updatePersonValidation

router.delete('/delete/:id', deletePerson)

router.get('/count', getPersonCount);

router.get('/users', getAllUsers);

router.get('/users/:id', getUser)

router.post('/addPersonWithRelationships', addPersonWithRelationships);

export default router;
