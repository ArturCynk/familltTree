import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { UserDocument } from '../models/User';
import { sendActivationEmail, sendPasswordResetEmail } from '../email/sendEmail';
import dotenv from 'dotenv';
dotenv.config();

export const registerUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
    
        if (user) {
            return res.status(400).json({ msg: 'Użytkownik już istnieje' });
        }
    
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        const newUser: UserDocument = new User({
            email,
            password: hashedPassword,
            isActive: false,
            accountType:'private'
        });

        await newUser.save();

        const activationToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET as string, {
            expiresIn: '24h'
        });
    
        newUser.activationToken = activationToken;
        await newUser.save();

        const activationLink = `http://localhost:3000/activate/${activationToken}`;
        await sendActivationEmail(email, activationLink);

        return res.status(201).json({ msg: 'Użytkownik zarejestrowany pomyślnie' });
    } catch (err) {
        console.error('Błąd podczas rejestracji użytkownika:', err);
        return res.status(500).send('Błąd serwera');
    }
};

export const activateAccount = async (req: Request, res: Response) => {
    // Pobierz token z parametrów zapytania
    const { token } = req.params;

    // Sprawdź, czy token został przesłany
    if (!token) {
        return res.status(400).json({ error: 'Brak tokenu aktywacyjnego.' });
    }

    try {
        // Zweryfikuj token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

        // Znajdź użytkownika na podstawie ID z tokena
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: 'Użytkownik nie został znaleziony.' });
        }

        // Sprawdź, czy konto już zostało aktywowane
        if (user.isActive) {
            return res.status(400).json({ error: 'Konto jest już aktywne.' });
        }

        // Aktywuj konto
        user.isActive = true;
        await user.save();

        return res.status(200).json({ message: 'Konto zostało pomyślnie aktywowane.' });

    } catch (error) {
        // Obsłuż błędy związane z tokenem JWT
        if (error instanceof jwt.JsonWebTokenError) {
            console.error('Nieprawidłowy token aktywacyjny:', error.message);
            return res.status(400).json({ error: 'Nieprawidłowy lub wygasły token aktywacyjny.' });
        } else {
            // Obsłuż inne błędy
            console.error('Błąd weryfikacji tokena aktywacyjnego:', error);
            return res.status(500).json({ error: 'Wystąpił nieoczekiwany błąd.' });
        }
    }
};


export const sendResetPasswordEmail = async (req: Request, res: Response) => {
    const { email } = req.body;
    
    try {
        const user: UserDocument | null = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
        }
        
        const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: '30m',
        });
        
        user.resetPasswordToken = resetToken;
        await user.save();

        const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
        
        await sendPasswordResetEmail(email, resetLink);
        
        return res.json({ msg: 'E-mail z resetowaniem hasła został wysłany' });
    } catch (error) {
        console.error('Błąd podczas wysyłania e-maila z resetowaniem hasła:', error);
        return res.status(500).json({ msg: 'Błąd serwera' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    
    if (!token) {
        return res.status(400).json({ msg: 'Nieprawidłowy token' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        await user.save();
        
        return res.json({ msg: 'Hasło zostało pomyślnie zresetowane' });
    } catch (error) {
        console.error('Błąd podczas resetowania hasła:', error);
        return res.status(400).json({ msg: 'Nieprawidłowy lub wygasły token' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Znajdź użytkownika po emailu
        let user: UserDocument | null = await User.findOne({ email :  email});

        if (!user) {
            return res.status(404).json({ msg: 'Konto nie zostało znalezione' });
        }

        // Sprawdź, czy konto jest aktywne
        if (!user.isActive) {
            return res.status(401).json({ msg: 'Konto nie jest aktywowane' });
        }

        // Porównaj hasło
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Nieprawidłowe hasło' });
        }

         if (user.twoFactorEnabled) {
      // Tymczasowy token tylko do weryfikacji 2FA
      const tempToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: '5m' }
      );

      return res.json({
        msg: 'Wymagana weryfikacja dwuetapowa',
        twoFactorRequired: true,
        tempToken,
        userId: user._id,
        method: user.twoFactorMethod
      });
    }

        // Tworzenie tokenu JWT bez limitu czasowego
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET as string // Bez ustawiania 'expiresIn'
        );
        
        // Zwróć token i wiadomość o sukcesie
        return res.json({
            msg: 'Logowanie zakończone sukcesem',
            token // Zwracamy token, który frontend może zapisać
        });
    } catch (err) {
        console.error('Błąd podczas logowania:', err);
        return res.status(500).json({ msg: 'Błąd serwera' });
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.user?.email })
      .select('-persons -password -activationToken -resetPasswordToken');
    
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    res.json({
      email: user.email,
      accountType: user.accountType,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorMethod: user.twoFactorMethod,
      twoFactorPhone: user.twoFactorPhone
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

  export const updateUser = async (req: Request, res: Response) => {
    try {
      const { email, accountType, newPassword } = req.body;
      const user = await User.findOne({ email: req.user?.email }).select('-persons');
  
      if (!user) return res.status(404).json({ msg: 'User not found' });
  
      if (email) user.email = email;
      if (accountType) user.accountType = accountType;
  
      if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }
  
      await user.save();
      res.json({ msg: 'User updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  };

  export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({}).select('email _id');
        return res.json(users);
    } catch (error) {
        console.error('Błąd podczas pobierania użytkowników:', error);
        return res.status(500).json({ msg: 'Błąd serwera' });
    }
};
  // controllers/authController.ts
export const update2FAPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ email: req.user?.email }).select('-persons');
    
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    user.twoFactorPhone = phone;
    await user.save();
    
    res.json({ msg: 'Phone number updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};
