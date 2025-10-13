import express from 'express';
import { addPersonValidation, updatePersonValidation } from '../validation/personValidator'; // Import reguł walidacji
import { addPerson, deletePerson, updatePerson, getAllPersons,addPersonWithRelationships, getFact, getRelations, deleteRelationship, getPersonsWithoutRelation, addRelation, getAllPersonss, getPerson, generatePersonReport} from '../controllers/personController'; // Import funkcji kontrolera
import { authenticateToken } from '../Middleware/authenticateToken';
import multer from 'multer';
import path from 'path';

// Konfiguracja multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder, w którym będą przechowywane zdjęcia
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);  // Rozszerzenie pliku
    const fileName = Date.now() + ext;  // Unikalna nazwa pliku
    cb(null, fileName);
  }
});

const upload = multer({ storage });

const router = express.Router();

// Trasa do dodawania nowej osoby z obsługą zdjęcia jako pliku lub URL
router.post('/add', authenticateToken, upload.single('photo'), addPersonValidation, addPerson);

// Definiowanie trasy do aktualizacji osoby z walidacją
router.put('/update/:id', authenticateToken, upload.single('photo'),  updatePerson);
// updatePersonValidation

router.delete('/delete/:id', authenticateToken, deletePerson)

router.get('/users',authenticateToken, getAllPersons);

router.get('/userss',authenticateToken, getAllPersonss);

router.get('/users/:id', authenticateToken, getPerson)

router.post('/addPersonWithRelationships', authenticateToken,upload.single('photo'), addPersonWithRelationships);

router.get('/users/fact/:id', authenticateToken, getFact);

router.get('/users/relation/:id', authenticateToken, getRelations);

router.delete('/relation/:personId/:relationId', authenticateToken, deleteRelationship); // New route

router.get('/persons-without-relation/:id', authenticateToken, getPersonsWithoutRelation);

router.post('/add-relation', authenticateToken, addRelation);

router.get('/download-pdf/:personId', authenticateToken, generatePersonReport)


export default router;
