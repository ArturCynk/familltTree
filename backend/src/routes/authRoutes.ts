import express, { Router } from 'express';
import { registerUser, activateAccount, sendResetPasswordEmail, resetPassword, loginUser, getCurrentUser, updateUser, getAllUsers } from '../controllers/authController';
// , loginUser, , resetPassword, logoutUser
import { registrationValidationRules, loginValidationRules, validate } from '../validation/authValidation';
import { authenticateToken } from '../Middleware/authenticateToken';

const router: Router = express.Router();

router.post('/register', registrationValidationRules, validate, registerUser);

router.post('/activate/:token', activateAccount);

router.post('/login', loginValidationRules, validate, loginUser);

router.post('/reset-password', sendResetPasswordEmail);

router.post('/reset-password/:token', resetPassword);

// router.post('/logout', logoutUser);

router.get('/me', authenticateToken, getCurrentUser);
router.put('/update',authenticateToken, updateUser);
router.get('/users', authenticateToken, getAllUsers);

export default router