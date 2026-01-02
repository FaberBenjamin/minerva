# 🚀 Minerva - GitHub Pages Telepítési Útmutató

Ez az útmutató lépésről lépésre végigvezet azon, hogyan publikálhatod a Minerva alkalmazást **GitHub Pages**-re **teljesen ingyenesen**.

---

## 📋 Előfeltételek

- ✅ GitHub repository létrehozva (FaberBenjamin/minerva)
- ✅ Firebase projekt beállítva (Authentication + Firestore)
- ✅ Minden kód fel van töltve GitHub-ra (Git LFS-szel a nagy CSV fájlhoz)

---

## 🔧 1. lépés: Firebase környezeti változók beállítása GitHub Secrets-ben

A Firebase konfiguráció **ne kerüljön** a publikus kódba! Helyette GitHub Secrets-et használunk.

### 1.1. Firebase konfiguráció lekérése

Ha nem emlékszel a Firebase konfigurációra:

1. Menj a [Firebase Console](https://console.firebase.google.com)-ra
2. Válaszd ki a **Minerva** projektet
3. Bal felső sarokban kattints a **⚙️ (Settings) ikonra** → **Project settings**
4. Görgess le a **"Your apps"** részhez
5. Válaszd ki a web app-ot (</> ikon)
6. Másold ki a config objektumot:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "minerva-xyz.firebaseapp.com",
  projectId: "minerva-xyz",
  storageBucket: "minerva-xyz.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 1.2. GitHub Secrets hozzáadása

1. Menj a GitHub repository-dra: https://github.com/FaberBenjamin/minerva
2. Kattints a **Settings** (Beállítások) fülre (jobb felül)
3. Bal oldali menüben: **Secrets and variables** → **Actions**
4. Kattints a **New repository secret** gombra
5. Add hozzá **MIND A 6 SECRET-et** egyesével:

| Secret név | Érték (Firebase config-ból) |
|------------|----------------------------|
| `VITE_FIREBASE_API_KEY` | `apiKey` érték |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` érték |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` érték |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` érték |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` érték |
| `VITE_FIREBASE_APP_ID` | `appId` érték |

**FONTOS:** A secret nevének **pontosan** így kell kinéznie (nagybetűk, aláhúzások)!

---

## 🌐 2. lépés: GitHub Pages aktiválása

1. Menj a repository **Settings** fülre
2. Bal oldali menüben görgess le a **Pages** menüpontra
3. **Source** résznél válaszd ki:
   - Source: **GitHub Actions** (NEM a "Deploy from a branch"!)
4. Kattints **Save**

---

## 🚀 3. lépés: Deploy elindítása

A GitHub Actions automatikusan elindul minden alkalommal, amikor push-olsz a `main` branch-re.

### Első deploy manuális indítása:

1. Menj a repository **Actions** fülére
2. Bal oldali menüben kattints a **Deploy to GitHub Pages** workflow-ra
3. Jobb felül kattints a **Run workflow** gombra
4. Kattints a zöld **Run workflow** gombra

### Deploy folyamat figyelése:

1. Az **Actions** fülön látod a futó workflow-t
2. Kattints rá, hogy részleteket láss
3. Várd meg, míg minden lépés zöld pipát kap ✅ (~3-5 perc)

---

## ✅ 4. lépés: Weboldal elérése

Ha minden zöld pipás:

🌍 **Az alkalmazásod elérhető itt:**

```
https://faberbenjamin.github.io/minerva/
```

**Megjegyzés:**
- Az `/minerva/` a repository neve, mert GitHub Pages így működik user/org accountoknál
- Ha custom domain-t szeretnél (pl. `minerva.hu`), kérdezz, beállítjuk!

---

## 🔄 5. lépés: Automatikus újra-deploy

Mostantól **MINDEN alkalommal** amikor push-olsz a `main` branch-re:

1. GitHub Actions automatikusan build-eli az alkalmazást
2. Automatikusan deploy-olja GitHub Pages-re
3. Az oldal frissül ~3-5 perc alatt

**Nincs más teendőd!** Csak dolgozz a kódon és push-olj.

---

## 📱 Tesztelés

### Főbb oldalak:

- **Regisztráció (publikus):** https://faberbenjamin.github.io/minerva/register
- **Admin bejelentkezés:** https://faberbenjamin.github.io/minerva/login
- **Dashboard:** https://faberbenjamin.github.io/minerva/ (csak bejelentkezve)

### Routing teszt:

1. Nyisd meg: https://faberbenjamin.github.io/minerva/register
2. Nyomd meg **F5** (frissítés)
3. **Működnie kell** (nem ad 404-et) - ez a 404.html trükk!

---

## 🐛 Hibaelhárítás

### ❌ Deploy sikertelen

**Hiba:** "Process completed with exit code 1" a build során

**Megoldás:**
1. Ellenőrizd, hogy mind a 6 Firebase secret be van-e állítva GitHub-on
2. Ellenőrizd a secret neveket (nagybetűk, aláhúzások!)
3. Nézd meg az Actions log-ot, mi a pontos hibaüzenet

### ❌ Üres oldal / "Failed to load module"

**Hiba:** Az oldal betölt, de üres vagy hibaüzenet van

**Megoldás:**
1. Ellenőrizd a böngésző Console-t (F12)
2. Ha "Failed to load module" vagy 404 hibákat látsz:
   - Ellenőrizd, hogy `vite.config.js`-ben `base: '/minerva/'` van-e
   - Rebuild & redeploy

### ❌ Firebase hiba

**Hiba:** "Firebase: Error (auth/invalid-api-key)" vagy hasonló

**Megoldás:**
- Ellenőrizd a GitHub Secrets értékeket
- Másold ki újra a Firebase Console-ból a helyes értékeket

### ❌ PIR adatok nem töltődnek be

**Hiba:** "Nem sikerült betölteni a PIR adatokat" vagy 404 hiba

**Megoldás:**
- Ellenőrizd, hogy a `public/districts/` mappa létezik-e
- Ellenőrizd, hogy vannak-e JSON fájlok benne (pl. `7624.json`)
- A böngésző Console-ban (F12) nézd meg a pontos hibát

---

## 🎯 Következő lépések (opcionális)

### Custom Domain beállítása

Ha saját domain-ed van (pl. `minerva.hu`):

1. GitHub repository Settings → Pages
2. **Custom domain** mezőbe írd: `minerva.hu`
3. DNS beállításokban add hozzá:
   ```
   Type: CNAME
   Name: www
   Value: faberbenjamin.github.io
   ```
4. Módosítsd `vite.config.js`-ben: `base: '/'` (töröld a `/minerva/`-t)

### HTTPS kikényszerítése

1. GitHub repository Settings → Pages
2. Pipáld be: **Enforce HTTPS**

---

## 📊 Költségek

**GitHub Pages:**
- ✅ **Teljesen ingyenes**
- ✅ 100 GB/hó bandwidth
- ✅ HTTPS automatikusan
- ✅ Korlátlan build

**Firebase (Spark plan - ingyenes):**
- ✅ Authentication: 10,000 users ingyenes
- ✅ Firestore: 50,000 read/20,000 write naponta
- ✅ Hosting NEM használva (GitHub Pages-t használsz)

---

## 🆘 Segítség

Ha valami nem működik:

1. Ellenőrizd az **Actions** fül alatt a log-okat
2. Nézd meg a böngésző **Console**-t (F12)
3. Ellenőrizd a **GitHub Secrets** beállításokat

---

**Utolsó frissítés:** 2026-01-01
**Verzió:** 1.0
**Státusz:** Production-ready ✅
