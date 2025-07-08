import express, { Router } from 'express';
import { registerUser, activateAccount, sendResetPasswordEmail, resetPassword, loginUser, getCurrentUser, updateUser, getAllUsers, update2FAPhone } from '../controllers/authController';
// , loginUser, , resetPassword, logoutUser
import { registrationValidationRules, loginValidationRules, validate } from '../validation/authValidation';
import { authenticateToken } from '../Middleware/authenticateToken';
import {
  enable2FA,
  verify2FASetup,
  disable2FA,
  send2FACode,
  verify2FALogin
} from '../controllers/twoFactorController';

const router: Router = express.Router();

router.post('/register', registrationValidationRules, validate, registerUser);

router.post('/activate/:token', activateAccount);

router.post('/login', loginValidationRules, validate, loginUser);

router.post('/reset-password', sendResetPasswordEmail);

router.post('/reset-password/:token', resetPassword);

// 2FA Endpoints
router.post('/2fa/enable', authenticateToken, enable2FA);
router.post('/2fa/verify-setup', authenticateToken, verify2FASetup);
router.post('/2fa/disable', authenticateToken, disable2FA);
router.post('/2fa/send-code', send2FACode);
router.post('/2fa/verify-login', verify2FALogin);
router.put('/update-2fa-phone', authenticateToken, update2FAPhone);

// router.post('/logout', logoutUser);

router.get('/me', authenticateToken, getCurrentUser);
router.put('/update',authenticateToken, updateUser);
router.get('/users', authenticateToken, getAllUsers);
export default router