import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { UserDocument } from '../models/User';
import { sendActivationEmail, sendPasswordResetEmail } from '../email/sendEmail';
// import { setUserId, clearUserId } from '../utils/sessionUtils';
// import { ObjectId } from 'mongodb';

export const registerUser = async (req: Request, res: Response) => {
    const { email, password} = req.body;

    try {
        let user = await User.findOne(email);
    
        if (user) {
          return res.status(400).json({ msg: 'User already exists' });
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

        return res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error('Error registering user:', err);
        return res.status(500).send('Server Error');
    };
};