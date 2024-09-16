import express, { Router } from 'express';
import { registerUser } from '../controllers/authController';
// activateAccount, loginUser, sendResetPasswordEmail, resetPassword, logoutUser
import { registrationValidationRules, loginValidationRules, validate } from '../validation/authValidation';

const router: Router = express.Router();

router.post('/register', registrationValidationRules, validate, registerUser);

// router.get('/activate/:token', activateAccount);

// router.post('/login', loginValidationRules, validate, loginUser);

// router.post('/reset-password', sendResetPasswordEmail);

// router.post('/reset-password/:token', resetPassword);

// router.post('/logout', logoutUser);

export default router