# Minerva - Feature Specifikációk UI/UX Tervezéshez

## Részletes Feature Leírások

---

## **Top 3 Gyors Win (1-2 nap)**

---

### **1. Admin Notes - Jegyzet hozzáadása önkéntesekhez**

**Mit csinál:**
Minden önkéntes profilján megjelenik egy "Jegyzetek" szekció, ahol az adminok privát megjegyzéseket írhatnak (pl. "Beszéltünk, inkább SMS-ben érhető el", "Autóval rendelkezik, tud szállítani", "Csak hétvégén elérhető"). A jegyzetek csak adminok számára láthatók, az önkéntesek nem látják őket. A rendszer automatikusan eltárolja, hogy ki és mikor írta a jegyzetet.

**UI elemek:**
- **VotingStationDetail.jsx** (szavazókör részletes nézet) és **UnknownDistricts.jsx** oldalon: minden önkéntes sorában egy új "Jegyzetek" ikon/gomb
- **Notes Modal/Panel**: kinyíló felület, ahol látható az összes meglévő jegyzet (időrendben), alul egy textarea új jegyzet írásához és "Mentés" gomb
- Meglévő jegyzetek megjelenítése kártyákban: szerző neve, dátum/idő, szöveg
- Opcionálisan: jegyzet törlése/szerkesztése funkció (csak a saját jegyzeteket)

**Use case-ek:**
- Kampányfőnök felhívja az önkéntest, de nem éri el. Beírja: "2024.03.15 - nem vette fel, próbáljuk holnap újra"
- Koordinátor megjegyzi, hogy az önkéntes speciális képességgel rendelkezik: "Grafikus, tud plakátokat tervezni"
- Több admin dolgozik együtt, és látják egymás megjegyzéseit, így nem kérdeznek ugyanarról kétszer

**Adatkezelés:**
```javascript
// Firestore volunteers collection-ben új mező:
notes: [
  {
    id: string,
    text: string,
    author: string (admin név),
    authorId: string (admin uid),
    createdAt: timestamp,
    updatedAt: timestamp (ha szerkeszthető)
  }
]
```

---

### **2. Email Automatizmus - "Köszönjük a regisztrációt" email**

**Mit csinál:**
Amikor egy önkéntes kitölti a publikus regisztrációs formot, a rendszer automatikusan küld neki egy köszönő emailt. Az email tartalmazza: "Köszönjük, hogy jelentkeztél!", az önkéntes OEVK körzetét és szavazókörét (ha sikerült meghatározni), és egy rövid üzenetet, hogy hamarosan felveszi valaki a kapcsolatot. Ha a cím ismeretlen volt, akkor azt írja, hogy "Címed egyeztetésre vár, keresni fogunk".

**UI elemek:**
- **Admin Email Template Editor** (új oldal az admin menüben): egy WYSIWYG vagy markdown editor, ahol az adminok szerkeszthetik az email sablonját
- Template változók: `{name}`, `{oevk}`, `{votingStation}`, `{status}` (matched/unknown)
- **Email Preview**: előnézet, hogy hogyan fog kinézni az email
- **Register.jsx**: nincs látható változás, háttérben történik az email küldés
- Opcionálisan: "Email history" szekció az önkéntes részletes nézetében (Dashboard), hogy lássa az admin, hogy milyen emaileket kapott

**Use case-ek:**
- Önkéntes regisztrál este 11-kor, másnap reggel meglepődik, hogy már kapott egy visszaigazoló emailt, érzi, hogy a szervezet profi
- Admin nem felejti el utána írni az új jelentkezőknek, mert a rendszer automatikusan küldi
- Az email tartalmaz egy "Ha bármilyen kérdésed van, írj ide: info@part.hu" linket, így a jelentkezők tudják, hova forduljanak

**Adatkezelés:**
- Firebase Cloud Functions vagy külső email service (SendGrid, Mailgun, Resend)
- Email templates Firestore-ban tárolva (`emailTemplates` collection)
- Opcionálisan: email log tárolása (`emailLogs` collection) audit célokból

```javascript
// emailTemplates collection:
{
  id: 'welcome_email',
  subject: 'Köszönjük a regisztrációdat!',
  body: 'Szia {name}! Köszönjük...',
  createdAt: timestamp,
  updatedAt: timestamp
}

// emailLogs collection (opcionális):
{
  volunteerId: string,
  templateId: string,
  sentAt: timestamp,
  status: 'sent' | 'failed',
  error: string (ha failed)
}
```

---

### **3. Analytics Dashboard - Statisztikák és chartok**

**Mit csinál:**
A Dashboard tetején megjelenik egy statisztikai összefoglaló panel 3-4 nagy számmal (total önkéntesek, OEVK-k száma ahol van önkéntes, ismeretlen címek száma, ma regisztráltak száma). Alatta egy idővonalas grafikon (line chart) az elmúlt 30 nap regisztrációiról (naponta hány új önkéntes). OEVK-nként lebontva egy bar chart mutatja, hogy melyik körzetben hány önkéntes van. Így egy pillantással látható a kampány haladása.

**UI elemek:**
- **Dashboard.jsx** tetején új szekció: **"Analytics Overview"**
- **Stat Cards** (4 db nagy számkártya): Total Volunteers, Active Districts (OEVK-k), Unknown Addresses, Today's Registrations
- **Line Chart**: X tengely = dátum (utolsó 30 nap), Y tengely = regisztrációk száma (Chart.js vagy Recharts library)
- **Bar Chart**: X tengely = OEVK körzetek, Y tengely = önkéntesek száma (rendezve csökkenő sorrendben)
- **Date Range Picker** (opcionális): hogy ne csak 30 napot, hanem egyedi időszakot is lehessen nézni

**Use case-ek:**
- Kampányfőnök reggel bejelentkezik, azonnal látja: "151 önkéntes összesen, ebből 12 ma reggel óta!"
- Látja a chartról, hogy tegnap nagy ugrás volt (közösségi médián ment virálisra a toborzó link)
- Bar chart alapján látja, hogy az 1-es OEVK-ban 45 önkéntes van, míg a 6-osban csak 8, ezért oda kell fókuszálni a toborzásra
- Kampány zárása előtt készít egy screenshotot a chartokról a beszámolóhoz

**Adatkezelés:**
- Firestore aggregate queries vagy Firebase Cloud Functions által generált napi összesítések
- Cached statistics (`analytics` collection) naponta frissítve:

```javascript
// analytics collection (denormalized cache):
{
  date: 'YYYY-MM-DD',
  totalVolunteers: number,
  newVolunteersToday: number,
  unknownAddresses: number,
  byOEVK: {
    '01': 45,
    '02': 32,
    '03': 18,
    ...
  }
}
```

---

## **Középtávú (3-5 nap)**

---

### **4. Availability/Schedule - Ki mikor ér rá dolgozni**

**Mit csinál:**
Az önkéntes regisztrációs form-on (vagy később az admin által manuálisan) be lehet állítani, hogy az önkéntes mikor elérhető (hétfő-vasárnap, délelőtt/délután/este, vagy konkrét időpontok). Az admin felületen szűrni lehet arra, hogy "kik érnek rá szombat délután", így könnyen össze lehet állítani egy door-knocking csapatot. Minden önkéntes profilján látható egy naptár nézet az elérhetőségeiről.

**UI elemek:**
- **Register.jsx**: új opcionális szekció "Mikor tudsz segíteni?" címmel
  - Checkbox lista: Hétköznap délelőtt / Hétköznap délután / Hétköznap este / Hétvégén délelőtt / Hétvégén délután / Hétvégén este
  - Vagy: naptár view, ahol rá lehet kattintani a napokra és időszakokra
- **VotingStationDetail.jsx** és **Dashboard**: "Szűrés elérhetőség szerint" dropdown
- **Önkéntes részletes nézet** (új modal/oldal): egy heti naptár rács (7 nap x 3 időszak), ahol színkódolva látszik, mikor elérhető
- **Bulk availability editor**: admin több önkéntes elérhetőségét egyszerre módosíthatja (ha telefonon egyeztettek)

**Use case-ek:**
- Kampányfőnök péntek reggel belép: "Szombat délután kell 20 ember leafletezésre". Rászűr "Hétvégén délután" elérhetőségre, egy kattintással exportálja a listát, és SMS-t küld nekik
- Önkéntes bejelöli, hogy csak este 6 után ér rá, így nem zavarják délelőtt
- Admin látja, hogy egy adott szavazókörnél nincs senki, aki hétköznap elérhető lenne, ezért átcsoportosít

**Adatkezelés:**
```javascript
// volunteers collection-ben új mező:
availability: {
  weekdayMorning: boolean,    // Hétköznap 6-12
  weekdayAfternoon: boolean,  // Hétköznap 12-18
  weekdayEvening: boolean,    // Hétköznap 18-22
  weekendMorning: boolean,
  weekendAfternoon: boolean,
  weekendEvening: boolean,
  // Vagy részletesebb:
  schedule: {
    monday: ['morning', 'evening'],
    tuesday: ['afternoon'],
    ...
  }
}
```

---

### **5. Aktivitás Tracker - Gamification, pontok feladatokért**

**Mit csinál:**
Az adminok nyomon követhetik, hogy az önkéntesek milyen feladatokat végeztek el (door-knocking, telefonálás, leafletezés, stb.). Minden feladatért pontot kap az önkéntes, és egy leaderboard (rangsor) mutatja a top 10 legaktívabb önkéntest. Az adminok manuálisan rögzítik a feladatokat (pl. "János 50 ajtót kopogott ma"), vagy később integrálható külső rendszerekkel. Az önkéntesek profilján látszik az összes feladat listája és a összpontszám.

**UI elemek:**
- **Dashboard.jsx**: új "Leaderboard" widget (top 10 önkéntes, név + pontszám)
- **VotingStationDetail.jsx**: minden önkéntes mellett látszik a pontszáma
- **Önkéntes profil modal** (új):
  - Felső részben nagy számmal az összes pont
  - Alatta táblázat: Dátum | Feladat típusa | Részletek | Pontszám
  - "Új feladat hozzáadása" gomb: modal, ahol kiválasztható a feladat típusa (dropdown), mennyiség (pl. 50 ajtó), megjegyzés, pont automatikusan számolódik
- **Activity Types Admin Panel** (új oldal): ahol az adminok beállíthatják a feladat típusokat és pontértékeket (pl. "Door-knocking: 1 ajtó = 2 pont", "Telefonálás: 1 hívás = 1 pont")

**Use case-ek:**
- Szombat este az önkéntesek beszámolnak: "50 ajtót kopogtak". Admin rögzíti a rendszerben, János lát 100 pontot a profilján, motivált
- Leaderboard-on látható, hogy Mária vezet 450 ponttal. A többi önkéntes látja a rangsorban, és motivációt kap, hogy beérjék
- Kampány végén a top 10-et megjutalmazzák (pl. köszönő esemény, ajándék)
- Admin látja, hogy ki aktív és ki "alvó" önkéntes (0 pont), ezáltal tudjuk, kit kell újra motiválni

**Adatkezelés:**
```javascript
// volunteers collection-ben:
activityPoints: number, // Összes pont (denormalized)
activities: [ // Vagy külön collection (volunteerActivities)
  {
    id: string,
    type: 'door-knocking' | 'phone-banking' | 'leafleting' | ...,
    quantity: number, // pl. 50 ajtó
    points: number,   // pl. 100 pont
    date: timestamp,
    notes: string,
    recordedBy: string (admin uid),
    createdAt: timestamp
  }
]

// activityTypes collection (admin által kezelt):
{
  id: 'door-knocking',
  name: 'Ajtóról-ajtóra járás',
  pointsPerUnit: 2,
  unit: 'ajtó',
  enabled: boolean
}
```

---

## **Hosszútávú (1-2 hét)**

---

### **6. Térképes Nézet - Heat Map a szavazókörökről**

**Mit csinál:**
A Dashboard-on megjelenik egy interaktív Magyarország térkép, ahol minden szavazókör egy pin/marker vagy polygon (ha van geometriai adat). A színkódolás alapján látszik, hogy hol van sok önkéntes (zöld) és hol kevés (piros/narancs). Rákattintva egy szavazókörre, megjelenik a részletes info (cím, önkéntesek száma, listájuk). Ez vizuális áttekintést ad a kampány földrajzi lefedettségéről, és könnyen azonosíthatók a fehér foltok.

**UI elemek:**
- **Dashboard.jsx**: új fül/tab: "Térkép Nézet" (vagy a táblázat mellett megjelenik egy "Map View" toggle)
- **Interaktív térkép**: Google Maps API, Mapbox vagy Leaflet.js
  - Pinok/markerek: minden szavazókör egy pin (vagy ha van polygon adat, akkor a területet is lehet rajzolni)
  - Színkódolás: Piros (0 önkéntes), Narancs (1-2), Sárga (3-5), Zöld (6+)
  - Hover: megjelenik egy tooltip (szavazókör neve, önkéntesek száma)
  - Kattintás: oldalsó panel vagy modal nyílik meg a szavazókör részleteivel
- **Szűrők**: OEVK szerinti szűrés (csak egy körzet térképe látszódjon), vagy önkéntesszám szerinti szűrés (pl. "Csak a 0 önkénteses körzetek")
- **Zoom & Pan**: térképen szabadon lehet navigálni

**Use case-ek:**
- Kampányfőnök látja a térképen, hogy Budapest 12. kerületében több szavazókörnél is 0 az önkéntes. Azonnal látja a földrajzi koncentrációt, és dönt: toborzó csapatot küld oda
- Vidéki kampány: látszik, hogy Szabolcs megyében ritka az önkéntes lefedettség, ezért regionális toborzó eseményt szerveznek
- Kampányzárás előtt screenshotot készít a térképről, mutatja, hogy "98%-os országos lefedettség"

**Adatkezelés:**
- Szavazókör geolokáció: PIR-based JSON fájlokban már van "Szavazókör cím", ebből geocoding API-val (Google Geocoding, Mapbox) GPS koordinátákat lehet generálni
- Cache-elt koordináták Firestore-ban (`votingStations` collection):

```javascript
{
  id: string, // OEVK + Szavazókör kombinációja
  oevk: string,
  votingStation: string,
  address: string,
  coordinates: {
    lat: number,
    lng: number
  },
  volunteerCount: number // Denormalized, naponta frissítve
}
```

- Térkép betöltésekor: Firestore lekérdezés az összes szavazókörre + volunteer count, majd render a térképen

---

### **7. SMS/Email Bulk - Kampány üzenetek küldése**

**Mit csinál:**
Az adminok a Dashboard-ról vagy egy dedikált "Kommunikáció" oldalról tömegesen tudnak SMS-t vagy emailt küldeni önkénteseknek. Szűrhetik a címzetteket OEVK szerint, elérhetőség szerint, vagy akár aktivitási pontszám szerint. Sablon választható (pl. "GOTV reminder", "Eseményre meghívó"), amit aztán egy kattintással el lehet küldeni. A rendszer nyomon követi, hogy kinek ment el üzenet és mikor.

**UI elemek:**
- **Új "Kommunikáció" menüpont** (BulkMessaging.jsx):
  - **Step 1 - Címzettek kiválasztása**: Multi-select szűrők (OEVK, availability, aktivitás, stb.). Élő számláló: "234 önkéntes kiválasztva"
  - **Step 2 - Üzenet típusa**: Radio button (SMS / Email)
  - **Step 3 - Sablon választás**: Dropdown (előre definiált sablonok) vagy "Új sablon írása"
  - **Step 4 - Üzenet szerkesztése**: Textarea, változók támogatása ({name}, {oevk}, stb.). Live preview az üzenetről
  - **Step 5 - Küldés**: "Küldés" gomb, confirmation modal ("Biztosan küldesz 234 SMS-t?")
- **Message Templates kezelő oldal** (új admin oldal): sablonok létrehozása, szerkesztése, törlése
- **Message History** (új szekció minden önkéntes profilján): lista az elküldött üzenetekről (dátum, típus, tartalom, státusz)

**Use case-ek:**
- Pénteki nap: admin kiválasztja az összes önkéntest, aki "Hétvégén elérhető", és küld egy SMS-t: "Szia {name}! Holnap 10-kor találkozunk a 3-as OEVK irodában leafletezésre. Ott vagy?"
- Kampányzárás előtt GOTV (Get Out The Vote) üzenetek: minden aktív önkéntesnek email megy, hogy "A választás napján számítunk rád!"
- Egy önkéntes panaszkodik, hogy nem kapott értesítést. Admin megnézi a Message History-t, látja, hogy az SMS failed state-ben van (rossz telefonszám), így telefonon felhívja

**Adatkezelés:**
- **messageTemplates collection**:
```javascript
{
  id: string,
  name: 'GOTV Reminder',
  type: 'sms' | 'email',
  subject: string (csak email esetén),
  body: 'Szia {name}! Ne feledd...',
  createdAt: timestamp,
  createdBy: string (admin uid)
}
```

- **messageLogs collection**:
```javascript
{
  id: string,
  volunteerId: string,
  type: 'sms' | 'email',
  templateId: string,
  content: string, // Renderelt tartalom (változók behelyettesítve)
  sentAt: timestamp,
  status: 'sent' | 'failed' | 'pending',
  error: string (ha failed),
  sentBy: string (admin uid)
}
```

- **SMS provider**: Twilio, Vonage, vagy magyar SMS gateway (pl. SMSAPI.hu)
- **Email provider**: SendGrid, Mailgun, Resend

---

### **8. Referral Program - Virális növekedés**

**Mit csinál:**
Minden önkéntes kap egy egyedi referral linket (pl. `minerva.app/register?ref=JANOS123`), amit megoszthat ismerőseivel. Amikor valaki ezen a linken keresztül regisztrál, mindketten kapnak extra pontot (gamification integráció). Az admin felületen látható, hogy ki hány embert hozott be, és egy "Top Recruiters" leaderboard is megjelenik. Ez ösztönzi az önkénteseket, hogy aktívan toborozzanak tovább.

**UI elemek:**
- **Önkéntes profil modal/oldal** (ha lesz önkéntes felület, vagy email-ben kapják):
  - "Hívd meg barátaidat!" szekció
  - Egyedi referral link megjelenítése (copy gomb)
  - Social media share gombok (Facebook, Twitter, WhatsApp)
  - Statisztika: "Eddig X ember regisztrált a linked révén!"
- **Admin Dashboard**:
  - Új widget: "Top Recruiters" (top 10, név + hozott emberek száma)
  - Minden önkéntes profilján: "Referrals" tab, ahol látszik a lista, hogy kiket hozott be (név, regisztráció dátuma)
- **Register.jsx**:
  - URL query param kezelése (`?ref=JANOS123`)
  - Háttérben mentésre kerül, hogy ki hozta be
  - Sikeres regisztráció után üzenet: "János meghívása alapján regisztráltál! Mindketten kaptok +10 pontot!"

**Use case-ek:**
- János önkéntes megkapja az email-t a referral linkjével. Megosztja a családi WhatsApp csoportban. 3 rokona regisztrál, János kap 30 pontot, felkerül a Top Recruiters listára
- Admin látja, hogy Mária 15 embert hozott be. Felhívja, megköszöni, és felkéri, hogy szervezzen egy kis "toborzó estét" a barátainak
- Kampány elején kevés az önkéntes. Elindítják a "Hozz 5 embert, nyerj ajándékot!" akciót, a referral program miatt exponenciálisan nő a regisztrációk száma

**Adatkezelés:**
```javascript
// volunteers collection-ben:
referralCode: string,  // Egyedi kód (pl. 'JANOS123', auto-generated)
referredBy: string | null,  // Ki hozta be (referralCode)
referralCount: number,      // Hány embert hozott be (denormalized)
referrals: [  // Vagy külön collection (referrals)
  {
    volunteerId: string,  // Aki regisztrált
    registeredAt: timestamp
  }
]
```

- **Referral kód generálás**: önkéntes neve alapján + random számok (pl. firstName.toUpperCase() + random 3 digit)
- **Pontok kiosztása**: amikor új önkéntes regisztrál `?ref=JANOS123` paraméterrel:
  1. Megtalálja János volunteer dokumentumát (referralCode === 'JANOS123')
  2. Új önkéntes `referredBy` mezőjébe beírja 'JANOS123'
  3. János `referralCount` növelése (+1)
  4. Activity tracker integráció: mindkettőnek +10 pont (ha az 5-ös feature implementálva van)

---

## Összegzés

Ezek a leírások már elég részletesek ahhoz, hogy egy UI/UX designer megértse:
- Milyen képernyők/modalok szükségesek
- Milyen interakciók történnek
- Milyen adatokat kell megjeleníteni
- Hogyan használnák valós kampány szituációkban

A következő lépésként a designer wireframe-eket, mockupokat és user flow diagramokat tud készíteni ezekből. Ha bármely feature-ről még részletesebb specifikációra van szükség (pl. konkrét gomb elhelyezések, színek, animációk), azt külön meg lehet beszélni!

---

**Dokumentum verzió:** 1.0
**Utolsó frissítés:** 2026-01-04
**Cél:** UI/UX tervezési specifikáció a Minerva feature-ekhez
