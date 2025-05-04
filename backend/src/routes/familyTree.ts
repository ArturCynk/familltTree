import express from 'express';
import { 
  createFamilyTree, 
  renameFamilyTree, 
  addMember, 
  editMember, 
  deleteMember, 
  importFamilyTree,
  changeOwner,   // 🆕
  deleteFamilyTree,  // 🆕
  deleteAllPersons,   // 🆕
  leaveFamilyTree,
  getUserTrees,
  getOwnedTrees
} from '../controllers/familyTreeController';
import { authenticateToken } from '../Middleware/authenticateToken';

const router = express.Router();

// Tworzenie nowego drzewa
router.post('/', authenticateToken, createFamilyTree);

// Zmiana nazwy drzewa
router.patch('/:id', authenticateToken, renameFamilyTree);

// Dodanie nowego członka do drzewa
router.post('/:id/members', authenticateToken, addMember);

// Edycja roli istniejącego członka
router.patch('/:id/members/:memberId', authenticateToken, editMember);

// Usunięcie członka z drzewa
router.delete('/:id/members/:memberId', authenticateToken, deleteMember);

// Importowanie drzewa (osób) do innego drzewa
router.post('/:targetTreeId/import', authenticateToken, importFamilyTree);

// 🔥🆕 Zmiana właściciela drzewa
router.patch('/:id/owner', authenticateToken, changeOwner);

// 🔥🆕 Usunięcie całego drzewa
router.delete('/:id', authenticateToken, deleteFamilyTree);

// 🔥🆕 Usunięcie wszystkich osób z drzewa
router.delete('/:id/persons', authenticateToken, deleteAllPersons);

router.post('/:id/leave',authenticateToken, leaveFamilyTree);


router.get('/my-trees', authenticateToken, getUserTrees);

router.get('/owned-trees', authenticateToken, getOwnedTrees);


export default router;
