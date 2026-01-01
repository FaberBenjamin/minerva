# Első Admin Fiók Létrehozása

Mivel az alkalmazás védett és csak adminok jelentkezhetnek be, az **első admin fiókot manuálisan** kell létrehozni a Firebase Console-on keresztül.

---

## 1. lépés: Firebase Authentication User létrehozása

1. Menj a [Firebase Console](https://console.firebase.google.com/)-ra
2. Válaszd ki a **minerva-volunteer-system** projektet
3. Menj az **Authentication** → **Users** tabra
4. Kattints az **Add user** gombra
5. Add meg:
   - **Email**: az első admin email címe (pl. `admin@example.com`)
   - **Password**: erős jelszó (pl. min. 8 karakter)
6. Kattints **Add user**-re
7. **Másold ki az újonnan létrehozott user `UID`-jét** (ez egy hosszú string, pl. `kF3x...`)

---

## 2. lépés: Admin profil létrehozása Firestore-ban

1. Ugyanazon a Firebase Console-on menj a **Firestore Database**-re
2. Kattints **+ Start collection**
3. Collection ID: `admins`
4. Kattints **Next**
5. Document ID-nak add meg **az előbb kimásolt UID-t**
6. Add hozzá az alábbi mezőket:

| Field | Type | Value |
|-------|------|-------|
| `uid` | string | Az előbb kimásolt UID |
| `email` | string | Az admin email címe (pl. `admin@example.com`) |
| `name` | string | Az admin neve (pl. `Rendszergazda`) |
| `createdAt` | timestamp | Kattints az órára és válaszd a jelenlegi időt |
| `invitedBy` | string | `system` (vagy az UID-t, ha már van admin) |

7. Kattints **Save**

---

## 3. lépés: Bejelentkezés

Most már be tudsz jelentkezni az alkalmazásba:

1. Nyisd meg az alkalmazást: `http://localhost:5173/login`
2. Add meg az email címet és jelszót
3. Sikeres bejelentkezés után átirányít a Dashboard-ra
4. Most már tudsz **további adminokat meghívni** az `/invite-admin` oldalon!

---

## Következő lépések

Miután bejelentkeztél:
- Menj az **Admin meghívása** oldalra (`/invite-admin`)
- Hívj meg további adminokat - ezekhez már **automatikusan létrejön** a Firestore profil is
- Az újabb adminok azonnal be tudnak jelentkezni

---

## Gyakori hibák

### "Nincs jogosultságod az admin felülethez"
- Ellenőrizd, hogy létrehoztad-e az `admins` collection-t a Firestore-ban
- Ellenőrizd, hogy a document ID pontosan megegyezik a user UID-jével
- Ellenőrizd, hogy az `uid` field értéke megegyezik a document ID-val

### "Hibás email cím vagy jelszó"
- Ellenőrizd az email és jelszó helyességét
- Ellenőrizd, hogy a user létrejött-e az Authentication-ben

---

**Fontos:** Az első admin után minden további admin meghívását az alkalmazáson belül végezd az `/invite-admin` oldalon!
