# Minerva - Önkéntes Toborzó Rendszer

Webalkalmazás politikai pártok számára az önkéntesek toborzásának és koordinálásának megkönnyítésére választási körzetek alapján.

## Jelenlegi Státusz

**Fázis 1: Setup & Core Infrastructure** ✅ KÉSZ

A projekt alapvető infrastruktúrája elkészült:
- React projekt Vite-tal
- Tailwind CSS szürke árnyalatos design
- React Router navigáció
- Firebase SDK integráció (konfiguráció szükséges)
- Alapvető projekt struktúra és routing
- Layout komponensek

## Gyors Kezdés

### Előfeltételek

- Node.js 20.19.0 vagy újabb
- npm 10.x vagy újabb
- Firebase projekt (lásd SETUP_GUIDE.md)
- Google Cloud projekt Sheets API-val (lásd SETUP_GUIDE.md)

### Telepítés

1. Klónozd a repository-t (vagy használd a jelenlegi mappát)

2. Telepítsd a függőségeket:
```bash
npm install
```

3. Hozd létre a `.env` fájlt a `.env.example` alapján:
```bash
cp .env.example .env
```

4. Töltsd ki a `.env` fájlt a Firebase és Google Cloud konfigurációval (lásd SETUP_GUIDE.md)

5. Indítsd el a fejlesztői szervert:
```bash
npm run dev
```

6. Nyisd meg a böngészőt: `http://localhost:5173`

## Projekt Struktúra

```
minerva/
├── src/
│   ├── components/       # Újrafelhasználható komponensek
│   │   ├── Header.jsx
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/           # Oldal komponensek
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── UnknownDistricts.jsx
│   │   └── VotingStationDetail.jsx
│   ├── services/        # Külső szolgáltatások (Firebase, API)
│   │   └── firebase.js
│   ├── contexts/        # React Context API (state management)
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility funkciók
│   ├── App.jsx         # Főkomponens routing-gal
│   ├── main.jsx        # Belépési pont
│   └── index.css       # Globális stílusok (Tailwind)
├── public/             # Statikus fájlok
├── .env.example        # Környezeti változók sablon
├── PROJECT_SUMMARY.md  # Teljes projekt specifikáció
├── SETUP_GUIDE.md      # Részletes telepítési útmutató
└── README.md           # Ez a fájl
```

## Elérhető Scriptek

```bash
# Fejlesztői szerver indítása
npm run dev

# Production build létrehozása
npm run build

# Production build előnézete
npm run preview

# Linter futtatása
npm run lint
```

## Technológiai Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite 7
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS
- **Backend/Auth:** Firebase Authentication
- **Database:** Firebase Firestore
- **APIs:** Google Sheets API
- **Excel Export:** ExcelJS

## Következő Fázisok

### Fázis 2: Authentication ⏳ Következő
- [ ] Firebase Auth integráció
- [ ] Belépés/Kijelentkezés UI
- [ ] Email meghívó generálás
- [ ] Protected routes élesítése

### Fázis 3: Adatbázis Integráció
- [ ] XLSX adatbázis feldolgozó modul
- [ ] Cím egyeztetési algoritmus
- [ ] Firestore adatmodell setup

### További fázisok
Lásd a `PROJECT_SUMMARY.md` fájlt a teljes fejlesztési ütemtervért.

## Környezeti Változók

A következő környezeti változókat kell beállítani a `.env` fájlban:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Google Sheets API
VITE_GOOGLE_API_KEY=
VITE_GOOGLE_CLIENT_ID=
VITE_SPREADSHEET_ID=
```

Részletes útmutatót a konfigurációhoz lásd a `SETUP_GUIDE.md` fájlban.

## Dokumentáció

- **PROJECT_SUMMARY.md** - Teljes projekt specifikáció és követelmények
- **SETUP_GUIDE.md** - Lépésről lépésre telepítési útmutató Firebase és Google Cloud konfigurációval

## Biztonság

- Környezeti változók (`.env`) nem kerülnek verziókezelésbe
- Firebase Security Rules korlátozza az adatokhoz való hozzáférést
- Csak hitelesített adminok férhetnek hozzá az alkalmazáshoz
- API kulcsokat domain és API alapján kell korlátozni

## Licenc

[TBD]

---

**Verzió:** 1.0 - Fázis 1
**Utolsó frissítés:** 2026-01-01
