import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const registrationValidationRules = [
  body('email', 'Podaj poprawny adres email').isEmail(),
  body('password', 'Hasło musi mieć co najmniej 8 znaków').isLength({ min: 8 }),
  body('password', 'Hasło musi zawierać przynajmniej jedną małą literę').matches(/[a-z]/),
  body('password', 'Hasło musi zawierać przynajmniej jedną wielką literę').matches(/[A-Z]/),
  body('password', 'Hasło musi zawierać przynajmniej jedną cyfrę').matches(/\d/),
  body('password', 'Hasło musi zawierać przynajmniej jeden znak specjalny').matches(/[@$!%*?&./\,]/),
];

export const loginValidationRules = [
  body('email').notEmpty().withMessage('Adres email jest wymagany'),
  body('password').notEmpty().withMessage('Hasło jest wymagane'),
];

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
