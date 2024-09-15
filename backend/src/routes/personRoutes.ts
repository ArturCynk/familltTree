import express from 'express';
import { addPersonValidation, updatePersonValidation } from '../validation/personValidator'; // Import reguł walidacji
import { addPerson, deletePerson, getPersonCount, updatePerson, getAllUsers, getUser, addPersonWithRelationships, getFact, getRelations, deleteRelationship, getPersonsWithoutRelation, addRelation } from '../controllers/personController'; // Import funkcji kontrolera

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

router.get('/users/fact/:id', getFact);

router.get('/users/relation/:id', getRelations);

router.delete('/relation/:personId/:relationId', deleteRelationship); // New route

router.get('/persons-without-relation/:id', getPersonsWithoutRelation);

router.post('/add-relation', addRelation);


export default router;
