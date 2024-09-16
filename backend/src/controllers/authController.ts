import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { UserDocument } from '../models/User';
import { sendActivationEmail, sendPasswordResetEmail } from '../email/sendEmail';

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