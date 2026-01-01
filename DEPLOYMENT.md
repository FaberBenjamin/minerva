# Deployment Guide - Minerva

## Firestore Security Rules Telepítése

A Firestore Security Rules fájl (`firestore.rules`) tartalmazza a biztonsági szabályokat, amelyek meghatározzák, hogy ki férhet hozzá az adatbázishoz.

### Automatikus telepítés (Firebase CLI)

1. **Firebase CLI telepítése** (ha még nincs meg):
   ```bash
   npm install -g firebase-tools
   ```

2. **Bejelentkezés Firebase-be**:
   ```bash
   firebase login
   ```

3. **Firebase projekt inicializálása** (ha még nincs firebase.json):
   ```bash
   firebase init firestore
   ```
   - Válaszd ki a Firestore-t
   - Hagyd meg az alapértelmezett `firestore.rules` fájlt
   - Hagyd meg az alapértelmezett `firestore.indexes.json` fájlt

4. **Firestore Rules deploy**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Manuális telepítés (Firebase Console)

1. Menj a [Firebase Console](https://console.firebase.google.com/)-ra
2. Válaszd ki a projektedet
3. Menj a **Firestore Database** → **Rules** fülre
4. Másold be a `firestore.rules` fájl tartalmát
5. Kattints a **Publish** gombra

## Biztonsági szabályok magyarázata

### Volunteers Collection
- **Publikus írás (CREATE)**: Bárki létrehozhat új önkéntest (publikus regisztráció)
- **Admin hozzáférés**: Csak adminok olvashatnak, frissíthetnek és törölhetnek

### Admins Collection
- Csak adminok férhetnek hozzá (olvasás/írás)

### Többi collection
- Csak adminok férhetnek hozzá

## Tesztelés

A rules teszteléséhez használd a Firebase Console **Rules Playground** funkcióját, vagy írj unit teszteket a `@firebase/rules-unit-testing` csomag használatával.

## Környezeti változók

Győződj meg róla, hogy az `.env` fájl tartalmazza az összes szükséges Firebase konfigurációt:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```
