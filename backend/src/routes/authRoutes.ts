import express, { Router } from 'express';
import { registerUser, activateAccount, sendResetPasswordEmail, resetPassword, loginUser } from '../controllers/authController';
// , loginUser, , resetPassword, logoutUser
import { registrationValidationRules, loginValidationRules, validate } from '../validation/authValidation';

const router: Router = express.Router();

router.post('/register', registrationValidationRules, validate, registerUser);

router.post('/activate/:token', activateAccount);

router.post('/login', loginValidationRules, validate, loginUser);

router.post('/reset-password', sendResetPasswordEmail);

router.post('/reset-password/:token', resetPassword);

// router.post('/logout', logoutUser);

export default router