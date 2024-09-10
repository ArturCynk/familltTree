import { check } from 'express-validator';

// Reguły walidacji dla dodawania osoby
export const addPersonValidation = [
  check('gender')
    .optional()
    .isIn(['male', 'female', 'non-binary'])
    .withMessage('Płeć musi być jedną z następujących: male, female, non-binary'),
  check('firstName')
    .isString()
    .withMessage('Imię musi być tekstem')
    .notEmpty()
    .withMessage('Imię jest wymagane'),
  check('middleName')
    .optional()
    .isString()
    .withMessage('Drugie imię musi być tekstem'),
  check('lastName')
    .isString()
    .withMessage('Nazwisko musi być tekstem')
    .notEmpty()
    .withMessage('Nazwisko jest wymagane'),
  check('maidenName')
    .optional()
    .isString()
    .withMessage('Nazwisko panieńskie musi być tekstem'),
  check('status')
    .isIn(['alive', 'deceased'])
    .withMessage('Status musi być jedną z następujących wartości: alive, deceased'),
];



// Reguły walidacji dla aktualizacji osoby
export const updatePersonValidation = [
  check('gender')
    .optional()
    .isIn(['male', 'female', 'non-binary'])
    .withMessage('Płeć musi być jedną z następujących: male, female, non-binary'),
  check('firstName').optional().isString().withMessage('Imię musi być tekstem'),
  check('middleName').optional().isString().withMessage('Drugie imię musi być tekstem'),
  check('lastName').optional().isString().withMessage('Nazwisko musi być tekstem'),
  check('maidenName').optional().isString().withMessage('Nazwisko panieńskie musi być tekstem'),
  check('birthDateType')
    .optional()
    .isIn(['exact', 'before', 'after', 'around', 'probably', 'between', 'fromTo'])
    .withMessage('Rodzaj daty urodzenia musi być prawidłowy'),
  check('birthDate').optional().isISO8601().toDate().withMessage('Data urodzenia musi być poprawną datą'),
  check('birthDateEnd').optional().isISO8601().toDate().withMessage('Koniec zakresu daty urodzenia musi być poprawną datą'),
  check('deathDateType')
    .optional()
    .isIn(['exact', 'before', 'after', 'around', 'probably', 'between', 'fromTo'])
    .withMessage('Rodzaj daty zgonu musi być prawidłowy'),
  check('deathDate').optional().isISO8601().toDate().withMessage('Data zgonu musi być poprawną datą'),
  check('deathDateEnd').optional().isISO8601().toDate().withMessage('Koniec zakresu daty zgonu musi być poprawną datą'),
];
