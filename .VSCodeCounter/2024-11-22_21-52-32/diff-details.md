# Diff Details

Date : 2024-11-22 21:52:32

Directory c:\\Users\\artur\\OneDrive\\Dokumenty\\familltTree\\frontend

Total : 62 files,  19171 codes, 44 comments, 77 blanks, all 19292 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [backend/.env](/backend/.env) | Properties | -4 | 0 | 0 | -4 |
| [backend/app.ts](/backend/app.ts) | TypeScript | -31 | -3 | -13 | -47 |
| [backend/package-lock.json](/backend/package-lock.json) | JSON | -1,676 | 0 | -1 | -1,677 |
| [backend/package.json](/backend/package.json) | JSON | -35 | 0 | -1 | -36 |
| [backend/src/Middleware/authenticateToken.ts](/backend/src/Middleware/authenticateToken.ts) | TypeScript | -19 | 0 | -8 | -27 |
| [backend/src/config/database.ts](/backend/src/config/database.ts) | TypeScript | -13 | 0 | -3 | -16 |
| [backend/src/controllers/authController.ts](/backend/src/controllers/authController.ts) | TypeScript | -132 | -13 | -40 | -185 |
| [backend/src/controllers/personController.ts](/backend/src/controllers/personController.ts) | TypeScript | -904 | -97 | -198 | -1,199 |
| [backend/src/email/sendEmail.ts](/backend/src/email/sendEmail.ts) | TypeScript | -33 | -1 | -5 | -39 |
| [backend/src/email/templates/activationEmail.ts](/backend/src/email/templates/activationEmail.ts) | TypeScript | -107 | 0 | -3 | -110 |
| [backend/src/email/templates/resetPasswordEmail.ts](/backend/src/email/templates/resetPasswordEmail.ts) | TypeScript | -94 | -5 | -12 | -111 |
| [backend/src/models/Person.ts](/backend/src/models/Person.ts) | TypeScript | -99 | 0 | -4 | -103 |
| [backend/src/models/User.ts](/backend/src/models/User.ts) | TypeScript | -40 | 0 | -4 | -44 |
| [backend/src/routes/authRoutes.ts](/backend/src/routes/authRoutes.ts) | TypeScript | -10 | -2 | -8 | -20 |
| [backend/src/routes/personRoutes.ts](/backend/src/routes/personRoutes.ts) | TypeScript | -31 | -4 | -18 | -53 |
| [backend/src/validation/authValidation.ts](/backend/src/validation/authValidation.ts) | TypeScript | -21 | 0 | -4 | -25 |
| [backend/src/validation/personValidator.ts](/backend/src/validation/personValidator.ts) | TypeScript | -50 | -2 | -5 | -57 |
| [backend/tsconfig.json](/backend/tsconfig.json) | JSON with Comments | -14 | 0 | -1 | -15 |
| [frontend/README.md](/frontend/README.md) | Markdown | 26 | 0 | 21 | 47 |
| [frontend/package-lock.json](/frontend/package-lock.json) | JSON | 18,501 | 0 | 1 | 18,502 |
| [frontend/package.json](/frontend/package.json) | JSON | 68 | 0 | 0 | 68 |
| [frontend/postcss.config.js](/frontend/postcss.config.js) | JavaScript | 6 | 0 | 1 | 7 |
| [frontend/public/index.html](/frontend/public/index.html) | HTML | 20 | 23 | 1 | 44 |
| [frontend/public/manifest.json](/frontend/public/manifest.json) | JSON | 25 | 0 | 1 | 26 |
| [frontend/src/App.test.tsx](/frontend/src/App.test.tsx) | TypeScript JSX | 8 | 0 | 2 | 10 |
| [frontend/src/App.tsx](/frontend/src/App.tsx) | TypeScript JSX | 46 | 42 | 10 | 98 |
| [frontend/src/components/Activate/Activate.tsx](/frontend/src/components/Activate/Activate.tsx) | TypeScript JSX | 44 | 1 | 7 | 52 |
| [frontend/src/components/ChangePassword/ChangePassword.tsx](/frontend/src/components/ChangePassword/ChangePassword.tsx) | TypeScript JSX | 107 | 1 | 14 | 122 |
| [frontend/src/components/Edit/Edit.tsx](/frontend/src/components/Edit/Edit.tsx) | TypeScript JSX | 456 | 10 | 35 | 501 |
| [frontend/src/components/Error/ErrorScreen.tsx](/frontend/src/components/Error/ErrorScreen.tsx) | TypeScript JSX | 20 | 1 | 4 | 25 |
| [frontend/src/components/ForgotPassword/ForgotPassword.tsx](/frontend/src/components/ForgotPassword/ForgotPassword.tsx) | TypeScript JSX | 83 | 0 | 9 | 92 |
| [frontend/src/components/HomePage/HomePage.tsx](/frontend/src/components/HomePage/HomePage.tsx) | TypeScript JSX | 75 | 3 | 5 | 83 |
| [frontend/src/components/LeftHeader/LeftHeader.tsx](/frontend/src/components/LeftHeader/LeftHeader.tsx) | TypeScript JSX | 85 | 3 | 6 | 94 |
| [frontend/src/components/ListView/AlphabetFilter.tsx](/frontend/src/components/ListView/AlphabetFilter.tsx) | TypeScript JSX | 31 | 2 | 6 | 39 |
| [frontend/src/components/ListView/Header.tsx](/frontend/src/components/ListView/Header.tsx) | TypeScript JSX | 72 | 1 | 7 | 80 |
| [frontend/src/components/ListView/ListView.tsx](/frontend/src/components/ListView/ListView.tsx) | TypeScript JSX | 273 | 13 | 35 | 321 |
| [frontend/src/components/ListView/Pagination.tsx](/frontend/src/components/ListView/Pagination.tsx) | TypeScript JSX | 48 | 0 | 6 | 54 |
| [frontend/src/components/ListView/PersonUtils.tsx](/frontend/src/components/ListView/PersonUtils.tsx) | TypeScript JSX | 14 | 1 | 3 | 18 |
| [frontend/src/components/ListView/ProfileCard.tsx](/frontend/src/components/ListView/ProfileCard.tsx) | TypeScript JSX | 362 | 8 | 39 | 409 |
| [frontend/src/components/ListView/SettingsModal.tsx](/frontend/src/components/ListView/SettingsModal.tsx) | TypeScript JSX | 99 | 0 | 4 | 103 |
| [frontend/src/components/ListView/TableRow.tsx](/frontend/src/components/ListView/TableRow.tsx) | TypeScript JSX | 131 | 0 | 9 | 140 |
| [frontend/src/components/ListView/Types.ts](/frontend/src/components/ListView/Types.ts) | TypeScript | 18 | 0 | 1 | 19 |
| [frontend/src/components/ListView/usePeople.ts](/frontend/src/components/ListView/usePeople.ts) | TypeScript | 43 | 2 | 8 | 53 |
| [frontend/src/components/Loader/LoadingSpinner.tsx](/frontend/src/components/Loader/LoadingSpinner.tsx) | TypeScript JSX | 7 | 1 | 3 | 11 |
| [frontend/src/components/LoginPage/LoginPage.tsx](/frontend/src/components/LoginPage/LoginPage.tsx) | TypeScript JSX | 116 | 4 | 16 | 136 |
| [frontend/src/components/LogoutButton/LogoutButton.tsx](/frontend/src/components/LogoutButton/LogoutButton.tsx) | TypeScript JSX | 28 | 4 | 7 | 39 |
| [frontend/src/components/Modal/Modal.tsx](/frontend/src/components/Modal/Modal.tsx) | TypeScript JSX | 452 | 14 | 29 | 495 |
| [frontend/src/components/NotAuthenticatedScreen/NotAuthenticatedScreen.tsx](/frontend/src/components/NotAuthenticatedScreen/NotAuthenticatedScreen.tsx) | TypeScript JSX | 17 | 1 | 3 | 21 |
| [frontend/src/components/Person/Person.tsx](/frontend/src/components/Person/Person.tsx) | TypeScript JSX | 107 | 4 | 12 | 123 |
| [frontend/src/components/RegisterPage/Register.tsx](/frontend/src/components/RegisterPage/Register.tsx) | TypeScript JSX | 125 | 1 | 14 | 140 |
| [frontend/src/components/RelationModal/AddPersonModal.tsx](/frontend/src/components/RelationModal/AddPersonModal.tsx) | TypeScript JSX | 454 | 13 | 31 | 498 |
| [frontend/src/components/RelationModal/RelationModal.tsx](/frontend/src/components/RelationModal/RelationModal.tsx) | TypeScript JSX | 139 | 4 | 17 | 160 |
| [frontend/src/components/RelationModal/SelectExistingPersonModal.tsx](/frontend/src/components/RelationModal/SelectExistingPersonModal.tsx) | TypeScript JSX | 170 | 1 | 12 | 183 |
| [frontend/src/components/deleteRelation/Modal.tsx](/frontend/src/components/deleteRelation/Modal.tsx) | TypeScript JSX | 140 | 5 | 13 | 158 |
| [frontend/src/index.css](/frontend/src/index.css) | CSS | 3 | 0 | 3 | 6 |
| [frontend/src/index.tsx](/frontend/src/index.tsx) | TypeScript JSX | 14 | 3 | 3 | 20 |
| [frontend/src/logo.svg](/frontend/src/logo.svg) | XML | 1 | 0 | 0 | 1 |
| [frontend/src/react-app-env.d.ts](/frontend/src/react-app-env.d.ts) | TypeScript | 0 | 1 | 1 | 2 |
| [frontend/src/reportWebVitals.ts](/frontend/src/reportWebVitals.ts) | TypeScript | 15 | 0 | 3 | 18 |
| [frontend/src/setupTests.ts](/frontend/src/setupTests.ts) | TypeScript | 1 | 4 | 1 | 6 |
| [frontend/tailwind.config.js](/frontend/tailwind.config.js) | JavaScript | 8 | 0 | 1 | 9 |
| [frontend/tsconfig.json](/frontend/tsconfig.json) | JSON with Comments | 26 | 0 | 1 | 27 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details