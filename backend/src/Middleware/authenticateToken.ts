import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserDocument } from '../models/User'; // Poprawny import typów

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Token w nagłówku Authorization

  if (token == null) return res.status(401).json({ msg: 'Brak tokenu' });

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) return res.status(403).json({ msg: 'Token jest nieprawidłowy' });
        
    next();
  });
};


