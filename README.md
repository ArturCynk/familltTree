# 🌳 FamilyTree App — Backend & Frontend Setup

Projekt składa się z dwóch części: **backendu** (Node.js + Express + MongoDB) oraz **frontendu** (React + TypeScript).

---

## ⚙️ Backend Setup

### 📋 Wymagania
- Node.js w wersji 18 lub nowszej  
- MongoDB (lokalnie lub zdalnie, np. MongoDB Atlas)  
- Konto w SendGrid  
- Konto w Twilio  

---

### 📁 Instalacja
```bash
cd backend
npm install
npm install nodemon
```

W folderze backend utwórz plik .env i dodaj poniższe dane konfiguracyjne:

# Serwer
PORT=3001

# MongoDB
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>

# JWT
JWT_SECRET=your_jwt_secret_token

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_seed
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+48123456789


💻 Frontend Setup
📁 Struktura
```bash
cd frontend
npm install
```

## 🧩 Instrukcja dodatkowa – aktualizacja pliku typów (TypeScript)
1. Przejdź do folderu frontendu:
2. Przejdź do folderu src
3. Przejdź do folderu components
4. Przejdź do folderu FamilyView
5. Otwórz plik `typ.ts` i **skopiuj całą jego zawartość**.
6. Następnie przejdź do folderu node_modules
7. Przejdź do folderu relatives-tree
8. Przejdź do folderu lib
9. Otwórz plik `types.d.ts` i **wklej do niego zawartość**, którą wcześniej skopiowałeś z `typ.ts`  
