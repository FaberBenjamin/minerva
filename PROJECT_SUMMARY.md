# Minerva - Önkéntes Toborzó Rendszer

## Projekt Áttekintés

A Minerva egy webalkalmazás, amely segíti a politikai pártok munkáját az önkéntesek toborzásában és koordinálásában választási körzetek alapján. A rendszer automatikusan hozzárendeli a jelentkezőket a lakóhelyük szerinti OEVK (Országos Egyéni Választókerület) körzethez és szavazókörhöz.

---

## Funkcionális Követelmények

### 1. Publikus Regisztráció

**Cél:** Önkéntesek regisztrációja online űrlapon keresztül.

**Hozzáférés:** Publikus route (`/register` vagy hasonló), link birtokában bárki megnyithatja

**Mezők:**
- Név (kötelező)
- Email (kötelező)
- Telefonszám (kötelező)
- Irányítószám / PIR (kötelező)
- Közterület név (kötelező, pl. "Kossuth")
- Közterület jelleg (kötelező, dropdown: utca, út, tér, köz, stb.)
- Házszám (kötelező)

**Működés:**
- A regisztrációs űrlap közvetlenül a Minerva alkalmazásban található
- Form beküldésekor automatikusan lefut a cím egyeztetési algoritmus
- Az adatok azonnal mentésre kerülnek a Firestore-ba
- Sikeres regisztráció után visszajelzés a felhasználónak

---

### 2. Adminisztrációs Felület (Minerva App)

**Hozzáférés:** Csak meghívott adminisztrátorok

#### 2.1 Autentikáció
- **Belépés:** Email + jelszó
- **Regisztráció:** Nincs publikus regisztráció
- **Meghívó rendszer:** Adminok manuálisan küldhetnek email meghívókat új adminoknak
- **Tech:** Firebase Authentication

#### 2.2 Főnézet - Szavazókörök Listája
- Szavazókörök listázása (szűrhető, kereshető)
- Minden szavazókörnél látható:
  - Szavazókör azonosító
  - OEVK körzet
  - Regisztrált önkéntesek száma
- Kattintásra megnyílik a szavazókör részletes nézete

#### 2.3 Szavazókör Részletes Nézet
- Az adott szavazókörhöz tartozó önkéntesek listája
- Megjelenített adatok minden önkéntesről:
  - Név
  - Email
  - Telefonszám
  - Teljes cím
  - OEVK körzet
  - Szavazókör

#### 2.4 Ismeretlen Körzetek Kezelése
- Külön lista azokról az önkéntesekről, akiknek a címe nem található az adatbázisban
- Admin manuálisan szerkesztheti az adatokat:
  - Javíthatja a címet
  - Hozzárendelheti a helyes OEVK-t és szavazókört
- A javítás után az önkéntes átkerül a normál listába

#### 2.5 Export Funkció
- OEVK körzetenként **külön Excel fájlok** generálása
- Minden fájl tartalma:
  - Név
  - Email
  - Telefonszám
  - Teljes cím
  - OEVK körzet
  - Szavazókör
- Letöltési opció minden OEVK-hoz

---

## Technikai Architektúra

### Frontend
- **Framework:** React
- **Styling:** Letisztult, szürke árnyalatos design
- **State Management:** React hooks + Context API
- **Könyvtárak:**
  - React Router (navigáció)
  - axios (API hívások)
  - xlsx/exceljs (Excel export)

### Backend / Adattárolás
- **Firebase Authentication:** Admin bejelentkezés
- **Firebase Firestore:**
  - Admin felhasználók tárolása
  - Önkéntesek adatai (közvetlen beküldés a publikus form-ról)
  - Szavazókör hozzárendelések
  - Választási adatbázis (XLSX import)

### Külső Integrációk
- Jelenleg nincs külső integráció
- A választási adatbázis (XLSX) egyszeri import után lokálisan/Firestore-ban tárolódik

---

## Adatstruktúra

### Választási Adatbázis (XLSX)
**Formátum:** ~1,000,000 sor
**Oszlopok (semicolon separated):**
```
Vármegye kód;Vármegye;OEVK;Település kód;Település;TEVK;Szavazókör;Szavazókör cím;Kijelölt;Akadálymentesített;PIR;Közterület név;Közterület jelleg;Házszám;Épület;Lépcsőház;Kapukód
```

**Példa sor:**
```
01;"Baranya";01;"0001";"Pécs";"001";"001";"Pécs, Ifjúság útja 6.";1;1;"7624";"Ifjúság";"útja";"6";"";"";"";
```

**Fontos mezők a cím-egyeztetéshez:**
- `PIR` (Irányítószám) - elsődleges szűrő
- `Közterület név`
- `Közterület jelleg`
- `Házszám`

**Kimenet mezők:**
- `OEVK` - Országos Egyéni Választókerület
- `Szavazókör`

### Firestore Kollekciók

#### `admins`
```javascript
{
  uid: string,
  email: string,
  name: string,
  createdAt: timestamp,
  invitedBy: string (uid)
}
```

#### `volunteers`
```javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  address: {
    pir: string,
    street: string,
    streetType: string,
    houseNumber: string,
    fullAddress: string
  },
  district: {
    oevk: string | null,
    votingStation: string | null,
    status: 'matched' | 'unknown'
  },
  createdAt: timestamp,
  submittedAt: timestamp
}
```

---

## Alkalmazási Logika

### Cím Egyeztetési Algoritmus

1. **Input:** Önkéntes által megadott cím adatok
   - PIR (Irányítószám)
   - Közterület név
   - Közterület jelleg
   - Házszám

2. **Szűrés az adatbázisban:**
   - Első szűrő: `PIR` egyezés
   - Második szűrő: `Közterület név` egyezés (case-insensitive, ékezet-toleráns)
   - Harmadik szűrő: `Közterület jelleg` egyezés
   - Negyedik szűrő: `Házszám` egyezés

3. **Eredmény:**
   - **Egyezés találva:** 
     - `OEVK` és `Szavazókör` kiolvasása
     - `status: 'matched'`
   - **Nincs egyezés:**
     - `OEVK: null`, `Szavazókör: null`
     - `status: 'unknown'`
     - Kerül az "Ismeretlen körzetek" listára

### Önkéntes Regisztráció Feldolgozása

1. **Trigger:** Form beküldése a publikus route-on
2. **Folyamat:**
   - Validáció (kötelező mezők, formátum ellenőrzés)
   - Cím egyeztetési algoritmus futtatása
   - Firestore-ba mentés
   - Duplikációk kezelése (email alapján)
   - Visszajelzés a felhasználónak (siker/hiba üzenet)

### Excel Export Generálás

1. **Input:** OEVK körzet azonosító
2. **Lekérdezés:** Firestore-ból az adott OEVK-hoz tartozó önkéntesek
3. **Generálás:** XLSX fájl létrehozása
4. **Letöltés:** Blob letöltése a böngészőben

---

## Biztonsági Megfontolások

### Hozzáférés Kontroll
- **Admin felület:** Csak Firebase Authentication-nel hitelesített felhasználók férhetnek hozzá
- **Publikus form:** Bárki elérheti (rate limiting ajánlott DoS védelem miatt)
- **Firestore Security Rules:**
  - Adminok: teljes olvasási/írási jog
  - Publikus form: csak írási jog a volunteers collection-be
  - Többi route: csak hitelesített adminok

### Adatvédelem
- Személyes adatok (név, email, telefon, cím) védett Firestore-ban
- HTTPS kommunikáció minden kérésnél
- reCAPTCHA v3 ajánlott a publikus form-on (spam/bot védelem)

### API Kulcsok
- Firebase config: környezeti változókban (.env)
- Firebase API kulcs: domain restriction beállítása

---

## Fejlesztési Fázisok

### Fázis 1: Setup & Core Infrastructure ✅
- [x] React projekt inicializálás
- [x] Firebase projekt létrehozás és konfiguráció
- [x] Alapvető routing és layout

### Fázis 2: Publikus Regisztrációs Form ✅
- [x] Publikus route (`/register`) létrehozása
- [x] Regisztrációs űrlap UI (név, email, telefon, cím mezők)
- [x] Form validáció (kötelező mezők, formátum ellenőrzés)
- [x] Firestore integráció (volunteers collection-be írás)
- [x] Sikeres/hiba visszajelzés UI
- [x] Firestore Security Rules beállítása
- [ ] (Opcionális) reCAPTCHA v3 integráció

### Fázis 3: Authentication ✅
- [x] Firebase Auth integráció
- [x] AuthContext létrehozása (globális auth state)
- [x] Belépés/Kijelentkezés UI
- [x] Email meghívó generálás (InviteAdmin oldal)
- [x] Protected routes implementálás
- [x] Admin ellenőrzés Firestore-ban (admin oldalak)

### Fázis 4: Adatbázis Integráció
- [ ] XLSX adatbázis feldolgozó modul
- [ ] Cím egyeztetési algoritmus implementálás
- [ ] Firestore adatmodell setup
- [ ] Választási adatbázis import logika

### Fázis 5: Admin UI - Főnézetek
- [ ] Szavazókörök lista (keresés, szűrés)
- [ ] Szavazókör részletes nézet
- [ ] Önkéntesek listája szavazókörönként

### Fázis 6: Admin UI - Kezelés
- [ ] Ismeretlen körzetek lista
- [ ] Manuális szerkesztés funkcionalitás
- [ ] Státusz frissítés

### Fázis 7: Export Funkció
- [ ] OEVK szerinti csoportosítás
- [ ] Excel fájl generálás
- [ ] Letöltési mechanizmus

### Fázis 8: Polish & Testing
- [ ] Design finomítás (szürke árnyalatok)
- [ ] Responsive design
- [ ] Hibakezelés és validáció
- [ ] Tesztelés

---

## Környezeti Változók

```env
# Firebase
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=

# reCAPTCHA (opcionális, spam védelem)
REACT_APP_RECAPTCHA_SITE_KEY=
```

---

## Jövőbeli Fejlesztési Lehetőségek

- Dashboard statisztikákkal (körzetenként hány önkéntes, stb.)
- SMS/Email kommunikáció önkéntesekkel
- Esemény/kampány menedzsment
- Mobilapp verzió
- Több párt/szervezet támogatása (multi-tenant)

---

## Projekt Tulajdonságok

- **Név:** Minerva
- **Cél:** Politikai pártok önkéntes koordinációja
- **Platform:** Web (React)
- **Adatbázis:** Firebase Firestore
- **Adatforrás:** Publikus regisztrációs form (direkt Firestore mentés)
- **Választási adatok:** ~1M soros XLSX (manuálisan feltöltve/importálva)
- **Design:** Minimalista, szürke árnyalatos

---

## Kontakt & Support

- Admin meghívók: Manuálisan email-en keresztül
- Technikai support: [TBD]

---

**Utolsó frissítés:** 2026-01-01
**Verzió:** 1.2
**Státusz:** Fázis 1-3 kész, Fázis 4 következik (Adatbázis Integráció)
