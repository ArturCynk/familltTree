import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User';
import { send2FACodeEmail } from '../email/sendEmail';
import dotenv from 'dotenv';
import { sendSMS } from '../sms/sendSMS';
import crypto from 'crypto';
dotenv.config();


// Generowanie kodów awaryjnych
const generateBackupCodes = (count = 10) => {
  return Array.from({ length: count }, () => ({
    code: crypto.randomBytes(5).toString('hex').toUpperCase(),
    used: false,
  }));
};

// Włączanie 2FA
export const enable2FA = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.user?.email })
    if (!user) return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });

    // Generowanie sekretu
    const secret = speakeasy.generateSecret({ length: 20 });
    user.twoFactorSecret = secret.base32;
    
    // Generowanie kodów awaryjnych
    user.backupCodes = generateBackupCodes();

    await user.save();

    // Generowanie QR Code
    const otpauthUrl = secret.otpauth_url || '';
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    res.json({
      secret: secret.base32,
      qrCode,
      backupCodes: user.backupCodes.map(code => code.code),
      msg: 'Skanuj kod QR w aplikacji autentykacyjnej'
    });
  } catch (error) {
    console.error('Błąd włączania 2FA:', error);
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};

// Weryfikacja pierwszego ustawienia 2FA
export const verify2FASetup = async (req: Request, res: Response) => {
  const { token, method } = req.body;
  
  try {
    const user = await User.findOne({ email: req.user?.email })
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ msg: 'Najpierw włącz 2FA' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ msg: 'Nieprawidłowy kod weryfikacyjny' });
    }

    user.twoFactorEnabled = true;
    user.twoFactorMethod = method;
    await user.save();

    // Wysłanie powiadomienia e-mail
    send2FACodeEmail(user.email, 'enabled');

    res.json({ 
      msg: '2FA włączone pomyślnie',
      backupCodes: user.backupCodes?.map(code => code.code) 
    });
  } catch (error) {
    console.error('Błąd weryfikacji 2FA:', error);
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};

// Wyłączanie 2FA
export const disable2FA = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.user?.email })
    if (!user) return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });

    user.twoFactorEnabled = false;
    user.twoFactorMethod = undefined;
    user.twoFactorSecret = undefined;
    user.backupCodes = undefined;
    await user.save();

    // Wysłanie powiadomienia e-mail
    send2FACodeEmail(user.email, 'disabled');

    res.json({ msg: '2FA wyłączone pomyślnie' });
  } catch (error) {
    console.error('Błąd wyłączania 2FA:', error);
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};

// Wysyłanie kodu 2FA
export const send2FACode = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ msg: '2FA nieaktywne' });
    }

    const token = speakeasy.totp({
      secret: user.twoFactorSecret!,
      encoding: 'base32'
    });

    switch (user.twoFactorMethod) {
      case 'email':
        await send2FACodeEmail(user.email, 'login', token);
        break;
      case 'sms':
        if (!user.twoFactorPhone) throw new Error('Brak numeru telefonu');
        await sendSMS(user.twoFactorPhone, `Twój kod weryfikacyjny: ${token}`);
        break;
    }

    res.json({ msg: 'Kod weryfikacyjny wysłany' });
  } catch (error) {
    console.error('Błąd wysyłania kodu 2FA:', error);
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};

// Weryfikacja kodu 2FA podczas logowania
export const verify2FALogin = async (req: Request, res: Response) => {
  const { userId, token, backupCode } = req.body;
  
  try {
    const user = await User.findById(userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ msg: '2FA nieaktywne' });
    }

    let verified = false;

    // Sprawdź kod główny
    if (token && user.twoFactorSecret) {
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1
      });
    }

    // Sprawdź kod awaryjny
    if (!verified && backupCode && user.backupCodes) {
      const backupIndex = user.backupCodes.findIndex(
        code => code.code === backupCode && !code.used
      );
      
      if (backupIndex !== -1) {
        verified = true;
        user.backupCodes[backupIndex].used = true;
        await user.save();
      }
    }

    if (!verified) {
      return res.status(400).json({ msg: 'Nieprawidłowy kod weryfikacyjny' });
    }

    // Generowanie finalnego tokena JWT
    const authToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET as string
    );

    res.json({
      msg: 'Weryfikacja 2FA udana',
      token: authToken
    });
  } catch (error) {
    console.error('Błąd weryfikacji 2FA:', error);
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};