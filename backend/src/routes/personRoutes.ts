import express from 'express';
import { addPersonValidation, updatePersonValidation } from '../validation/personValidator'; // Import reguł walidacji
import { addPerson, deletePerson, getPersonCount, updatePerson, getAllUsers, getUser, addPersonWithRelationships, getFact, getRelations, deleteRelationship, getPersonsWithoutRelation, addRelation } from '../controllers/personController'; // Import funkcji kontrolera
import { authenticateToken } from '../Middleware/authenticateToken';

const router = express.Router();

// Definiowanie trasy do dodawania nowej osoby z walidacją
router.post('/add', authenticateToken, addPersonValidation, addPerson);

// Definiowanie trasy do aktualizacji osoby z walidacją
router.put('/update/:id', authenticateToken,  updatePerson);
// updatePersonValidation

router.delete('/delete/:id', authenticateToken, deletePerson)

router.get('/count', authenticateToken, getPersonCount);

router.get('/users',authenticateToken, getAllUsers);

router.get('/users/:id', authenticateToken, getUser)

router.post('/addPersonWithRelationships', authenticateToken, addPersonWithRelationships);

router.get('/users/fact/:id', authenticateToken, getFact);

router.get('/users/relation/:id', authenticateToken, getRelations);

router.delete('/relation/:personId/:relationId', authenticateToken, deleteRelationship); // New route

router.get('/persons-without-relation/:id', authenticateToken, getPersonsWithoutRelation);

router.post('/add-relation', authenticateToken, addRelation);


export default router;
