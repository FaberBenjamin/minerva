# Minerva - Telepítési és Konfigurációs Útmutató

## Előfeltételek

- Node.js 20.19.0 vagy újabb
- npm 10.x vagy újabb
- Google Account (Firebase és Google Cloud projektek létrehozásához)

---

## 1. Projekt Inicializálás

A projekt már létre van hozva és a szükséges csomagok telepítve vannak. Ha tiszta telepítésre van szükség:

```bash
npm install
```

---

## 2. Firebase Projekt Létrehozása

### 2.1 Firebase Console

1. Látogass el a [Firebase Console](https://console.firebase.google.com/)-ra
2. Kattints a **"Create a project"** vagy **"Add project"** gombra
3. Adj nevet a projektnek (pl. "minerva-volunteer-system")
4. Google Analytics opcionális - a projekt szempontjából nem szükséges
5. Kattints a **"Create project"** gombra

### 2.2 Firebase Authentication Beállítása

1. A Firebase projekt dashboardon válaszd ki a **"Authentication"** menüpontot
2. Kattints a **"Get started"** gombra
3. A **"Sign-in method"** fülön:
   - Kattints az **"Email/Password"** sorra
   - Kapcsold be az **"Email/Password"** opciót (az Email link opció maradhat kikapcsolva)
   - Kattints a **"Save"** gombra

### 2.3 Firestore Database Létrehozása

1. A Firebase projekt dashboardon válaszd ki a **"Firestore Database"** menüpontot
2. Kattints a **"Create database"** gombra
3. Válaszd ki a lokációt (pl. "eur3 (europe-west)")
4. Kezdd **"production mode"**-ban (később módosítjuk a szabályokat)
5. Kattints a **"Enable"** gombra

### 2.4 Firestore Security Rules Beállítása

A Firestore szabályok módosításához:

1. Menj a **"Firestore Database"** > **"Rules"** fülre
2. Cseréld ki a szabályokat az alábbira:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Csak hitelesített felhasználók férhetnek hozzá az adatokhoz
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // Adminok kollekció - csak hitelesített adminok
    match /admins/{adminId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == adminId;
    }

    // Önkéntesek kollekció - csak hitelesített adminok
    match /volunteers/{volunteerId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Kattints a **"Publish"** gombra

### 2.5 Firebase Konfiguráció Megszerzése

1. A Firebase projekt dashboardon kattints a fogaskerék ikonra > **"Project settings"**
2. Görgess le a **"Your apps"** részhez
3. Kattints a **"Web"** ikonra (</>) egy web app regisztrálásához
4. Add meg az app nevét (pl. "Minerva Web")
5. A Firebase Hosting opció maradhat kikapcsolva
6. Kattints a **"Register app"** gombra
7. Másold ki a konfigurációs adatokat (ezt később a `.env` fájlba fogod beilleszteni)

---

## 3. Google Cloud Projekt és Sheets API

### 3.1 Google Cloud Console

1. Látogass el a [Google Cloud Console](https://console.cloud.google.com/)-ra
2. Ha új projektet szeretnél:
   - Kattints a projekt kiválasztó dropdownra (fent)
   - Kattints a **"NEW PROJECT"** gombra
   - Adj nevet a projektnek
   - **FONTOS:** Ha már van Firebase projekted, akkor válaszd ki azt a projektet a dropdownból a Google Cloud Console-ban. A Firebase automatikusan létrehoz egy Google Cloud projektet.

### 3.2 Google Sheets API Engedélyezése

1. A Google Cloud projekt dashboardon:
2. Menj a **"APIs & Services"** > **"Library"** menüpontra
3. Keresd meg a **"Google Sheets API"**-t
4. Kattints rá és nyomd meg az **"Enable"** gombot

### 3.3 API Credentials Létrehozása

#### OAuth 2.0 Client ID

1. Menj az **"APIs & Services"** > **"Credentials"** menüpontra
2. Kattints a **"+ CREATE CREDENTIALS"** gombra
3. Válaszd az **"OAuth client ID"** opciót
4. Ha ez az első alkalom, konfigurálnod kell az OAuth consent screent:
   - User Type: **External** (ha nem Google Workspace-ed van)
   - App name: "Minerva"
   - User support email: a saját email címed
   - Developer contact: a saját email címed
   - Mentsd el
5. Ezután térj vissza az **"OAuth client ID"** létrehozásához:
   - Application type: **Web application**
   - Name: "Minerva Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (fejlesztéshez)
     - Add hozzá a production domain-t később
   - Authorized redirect URIs: (opcionális most)
   - Kattints a **"Create"** gombra
6. Másold ki a **Client ID**-t (ezt később a `.env` fájlba fogod beilleszteni)

#### API Key (opcionális, de ajánlott)

1. Menj az **"APIs & Services"** > **"Credentials"** menüpontra
2. Kattints a **"+ CREATE CREDENTIALS"** gombra
3. Válaszd az **"API key"** opciót
4. Másold ki az API key-t
5. **FONTOS:** Korlátozd az API key használatát:
   - Kattints a létrehozott API key-re
   - **"Application restrictions"**: HTTP referrers (web sites)
     - Add hozzá: `localhost:5173/*` (fejlesztéshez)
     - Add hozzá a production domain-t később
   - **"API restrictions"**: Restrict key
     - Válaszd ki: Google Sheets API
   - Mentsd el

### 3.4 Google Sheets Létrehozása a Form Válaszokhoz

1. Hozz létre egy [új Google Form](https://forms.google.com/)-ot
2. Add hozzá a mezőket a `PROJECT_SUMMARY.md` szerint:
   - Név (Short answer, Required)
   - Email (Short answer, Required)
   - Telefonszám (Short answer, Required)
   - Irányítószám / PIR (Short answer, Required)
   - Közterület név (Short answer, Required)
   - Közterület jelleg (Dropdown, Required: utca, út, tér, köz, stb.)
   - Házszám (Short answer, Required)
3. Linkeld a Form-ot egy Google Sheets-hez:
   - Responses fül > Create Spreadsheet
4. Másold ki a Spreadsheet ID-t az URL-ből:
   - URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - A `{SPREADSHEET_ID}` rész kell

---

## 4. Környezeti Változók Beállítása

1. Másold le a `.env.example` fájlt `.env` néven:

```bash
cp .env.example .env
```

2. Nyisd meg a `.env` fájlt és töltsd ki az értékeket a Firebase és Google Cloud konfigurációból:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Google Sheets API Configuration
VITE_GOOGLE_API_KEY=AIzaSy... (opcionális)
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

**FONTOS:** A `.env` fájl a `.gitignore`-ban van, így nem kerül verziókezelésbe!

---

## 5. Első Admin Felhasználó Létrehozása

Mivel nincs publikus regisztráció, az első admin felhasználót manuálisan kell létrehozni a Firebase Console-ban:

1. Firebase Console > **"Authentication"** > **"Users"** fül
2. Kattints az **"Add user"** gombra
3. Add meg az email címet és jelszót
4. Kattints a **"Add user"** gombra
5. Másold ki a létrehozott felhasználó **UID**-jét

### Firestore Admin Dokumentum Létrehozása

1. Firebase Console > **"Firestore Database"**
2. Kattints a **"+ Start collection"** gombra
3. Collection ID: `admins`
4. Document ID: **Használd a felhasználó UID-jét**
5. Add hozzá a következő mezőket:
   - `email` (string): a felhasználó email címe
   - `name` (string): a felhasználó neve
   - `createdAt` (timestamp): jelenlegi időpont
   - `invitedBy` (string): "system" (vagy hagyd üresen az első admin esetében)
6. Kattints a **"Save"** gombra

Most már be tudsz jelentkezni ezzel a felhasználóval az alkalmazásba!

---

## 6. Alkalmazás Futtatása

### Fejlesztői mód

```bash
npm run dev
```

Az alkalmazás elérhető lesz a `http://localhost:5173` címen.

### Build production-re

```bash
npm run build
```

A build eredménye a `dist` mappába kerül.

### Preview production build

```bash
npm run preview
```

---

## 7. Következő Lépések (Fázis 2+)

- **Fázis 2:** Firebase Authentication integráció (login/logout funkciók)
- **Fázis 3:** XLSX adatbázis feldolgozás és cím egyeztetési algoritmus
- **Fázis 4:** Google Sheets szinkronizálás automatizálás
- **Fázis 5:** Admin UI - Főnézetek implementálása
- **Fázis 6:** Ismeretlen körzetek kezelése
- **Fázis 7:** Excel export funkció
- **Fázis 8:** Design finomítás és tesztelés

---

## Hibaelhárítás

### Firebase kapcsolódási hiba

- Ellenőrizd, hogy a `.env` fájlban minden érték helyes-e
- Restart the dev server after changing `.env` values

### Google Sheets API hiba

- Ellenőrizd, hogy a Sheets API engedélyezve van-e a Google Cloud Console-ban
- Ellenőrizd az API key és Client ID korlátozásait
- Győződj meg róla, hogy a Spreadsheet ID helyes

### CORS hiba

- Ellenőrizd az OAuth Client ID-nél az Authorized JavaScript origins beállítást
- Add hozzá a `http://localhost:5173` domaint

---

## Biztonság

- **SOHA** ne commitolj `.env` fájlt a repository-ba
- Az API key-eket és Client ID-kat mindig korlátozd domain/API alapján
- Production környezetben módosítsd a Firestore Security Rules-t szigorúbbra
- Használj HTTPS-t production környezetben

---

## Támogatás

Ha kérdésed van a setup folyamattal kapcsolatban, nézd meg a következő dokumentációkat:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**Utolsó frissítés:** 2026-01-01
**Verzió:** 1.0 - Fázis 1 Complete
