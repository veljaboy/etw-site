# Plan i Status Projekta — ETW Elektrische Anlagen OG

Ovaj fajl služi kao trajna memorija projekta. Pri svakom pokretanju sesije pročitaj ovaj fajl kako bi znao šta je do sada urađeno i šta je sledeći korak.

## 1. Šta je do sada urađeno (Faza 1)
- **Tehnologije:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Prisma ORM + SQLite (`prisma/dev.db`), FullCalendar.
- **Baza podataka (`prisma/schema.prisma`):**
  - `Radnik` (`id`, `ime`, `boja`, `zadaci`)
  - `Anfrage` (`id`, `vorname`, `nachname`, `telefon`, `email`, `adresse`, `wunschtermin`, `beschreibung`, `status`, `createdAt`, `radnikId`)
- **Šefov Dispečerski Centar (`/chef`):**
  - FullCalendar sa `resource-timegrid` dodatkom (kolona "Čeka na dodelu" + kolone za svakog radnika).
  - Drag & Drop poslova između kolona i datuma preko `/api/anfrage/update`.
- **Mobilna aplikacija za radnike (`/radnik`):**
  - Prijava klikom na ime radnika.
  - Prikaz dodeljenih zadataka sa dugmetom za Google Maps navigaciju.
- **Slike sačuvane u `public/`:**
  - `public/etw-logo.png` — Zvanični ETW logo (crveni pravougaonik sa žutom munjom u slovu E).
  - `public/hero-bg.jpg` — Referentna slika za Hero pozadinu (električar radi na razvodnoj tabli sa belim prelazom na levoj strani).
  - `public/auftragsschein-vorlage.jpg` — Skenirani originalni *Auftragsschein* formular.

---

## 2. Novi zahtevi električara (Faza 2 — Lista zadataka)

### A. Dizajn sajta i početna stranica (`app/page.tsx`) — ✅ ZAVRŠENO
- [x] **Novi Logo (`public/etw-logo-cropped.png`):** Zamenjen tekstualni improvizovani logo pravom slikom logotipa.
- [x] **Hero sekcija sa pozadinskom slikom preko cele širine:** Očišćena pozadinska slika (`public/hero-clean.jpg`) — slika električara koji radi na razvodnoj tabli sa desne strane sa glatkim prelazom (fade) u belu pozadinu sa leve strane gde stoji tekst.
- [x] **Crveno-bele ikonice na sajtu:** Zamenjene sve obične emoji ikonice čistim, modernim **crveno-belim SVG ikonicama** (crveni bedž `#e60000` sa belom vektorskom ikonicom).
- [x] **Obrisano dugme "Mehr über uns":** Uklonjeno dugme "Mehr über uns" iz Hero sekcije i iz sekcije *Über uns*, a umesto sive placeholder kutije postavljena moderna kontakt kartica sa ETW logom.

### B. Forma za upit na sajtu — Samo E-mail šefu (`app/angebot/page.tsx` & `app/api/kontakt-email/route.ts`) — ✅ ZAVRŠENO
- [x] **Upiti sa sajta NE idu direktno u kalendar:** Klijent na sajtu popuni jednostavnu formu (*Name, Adresse, Kontakt, Anliegen*) i klikne *Absenden*.
- [x] **Slanje na e-mail šefa:** Upit ide preko `/api/kontakt-email` na e-mail šefa (`CHEF_EMAIL` u `.env`), a ne upisuje se automatski u kalendar.

### C. Šefov panel i Napredni Kalendar (`app/chef/page.tsx` & `CalendarComponent.tsx`) — ✅ ZAVRŠENO
- [x] **Kalendar prikazuje samo poslove koje šef sam unese:** Nema automatskog upadanja sa sajta u kalendar.
- [x] **Ručno kreiranje i izmena poslova od strane šefa:** Šef u `/chef` panelu ima dugme **"+ Novi posao"** (ili može kliknuti/prevući mišem direktno po satima u kalendaru) gde sam unosi: Ime klijenta, Adresu, Opis posla, Datum, **Tačno vreme od–do (npr. 08:00 – 11:30)** i Radnika. Može i da klikne na postojeći posao u kalendaru ili u tabeli da ga izmeni ili obriše, kao i da mu menja trajanje i satnicu prevlačenjem (`eventDrop` / `eventResize`).
- [x] **Poboljšan dizajn rasporeda:** Pregledan prikaz po satima (`06:00 – 20:00`, slotovi po 30 min), statističke kartice na vrhu, jasno vidljiva satnica `od–do` i na karticama u kalendaru i kod radnika u `/radnik`.

### D. Aplikacija za radnike — Auftragsschein PDF (`app/components/RadnikAplikacija.tsx` & `AuftragsscheinModal.tsx`) — ✅ ZAVRŠENO
- [x] **Obrisano dugme "📞 Pozovi klijenta"** kod radnika.
- [x] **Dodato dugme za "📄 Auftragsschein (PDF)":** Napravljen `AuftragsscheinModal.tsx` po uzoru na skenirani dokument (`public/auftragsschein-vorlage.jpg`), gde se automatski popunjavaju podaci iz posla (`Datum`, `Vereinbarter Termin`, `Monteur`, `Kunde`, `Adresse`, `Durchzuführende Arbeit`), a radnik može da dopuni `mit`, tabelu materijala (`Menge`, `Einheit`, `Material - Bezeichnung`, `KFZ`), `Zeitaufwand (von / bis / Gesamt)`, `Durchgeführte Arbeiten`, `Auftrag abgeschlossen (Ja/Nein)`, klijent može prstom na ekranu da se potpiše (`Unterschrift/Stempel Kunde`), i jednim klikom se čuva/štampa gotov A4 PDF!

### E. Pravne stavke za Austriju (Na samom kraju kada sve bude gotovo)
- [ ] **Impressum, Datenschutz (GDPR), Zertifikate, Cookies & Einwilligungen** (po austrijskom zakonu ECG / DSGVO).



---

## 3. Nadogradnje po povratnoj informaciji (Faza 2.5 — ✅ ZAVRŠENO)
- [x] **Nova AI-generisana Hero pozadinska slika u visokoj rezoluciji (`public/hero-clean.jpg`):** Fotorealistična 16:9 slika visoke rezolucije (ruka električara u zaštitnim rukavicama sa crvenim VDE šrafcigerom na razvodnoj tabli sa desne strane + čist beli prostor sa leve strane, bez ikakve pikselizacije).
- [x] **Fotografije PRE i POSLE radova (`Vorher / Nachher`) u Auftragsschein-u + galerija za šefa:**
  - Radnik u `AuftragsscheinModal.tsx` direktno sa telefona (preko kamere ili galerije) slika **Slika PRE** i **Slika POSLE**.
  - Slike se automatski kompresuju na telefonu i čuvaju u bazi (`slikaPre`, `slikaPosle`, `izvestajRadnika` u `Anfrage`), prikazuju se u **Auftragsschein PDF-u**, a šef ih odmah vidi u `/chef` panelu (i u posebnoj sekciji *📸 Fotodokumentacija sa terena*, i u tabeli, i klikom na posao sa opcijom uvećanja slike preko celog ekrana).
- [x] **Pametni Kalendar za 5, 10 ili više radnika (bez zbijenih kolona):**
  - Dodata traka za brzi izbor/filtriranje radnika iznad kalendara (`👥 Svi radnici`, `⚠️ Čeka na dodelu`, ili klik na pojedinačnog radnika `👷 Marko`, `👷 Stefan`, `👷 Nikola`...).
  - Kada šef klikne na jednog radnika, kalendar se širi preko celog ekrana samo za tog radnika (uz opciju da vidi i kolonu *Čeka na dodelu* za lako prevlačenje, ili da prebaci na *Nedelja (Woche)* i vidi celu nedelju samo za tog radnika).
  - Kada gleda sve radnike odjednom (`👥 Svi radnici`), postavljeno je `dayMinWidth={220}` tako da nijedna kolona nikada ne postaje uska/zbijena čak ni sa 10+ radnika, već se pojavljuje horizontalni skrol.
  - Dodato i dugme **`👷+ Dodaj radnika`** direktno u `/chef` panelu.

## 4. Dvojezičnost (DE / SR), Direktna Kamera i WOW Animacije (Faza 3 — ✅ ZAVRŠENO)
- [x] **Uklonjeno duplo dugme za dodavanje posla u `/chef`:** Zadržano jedno glavno dugme `+ Neuer Auftrag / + Novi posao`.
- [x] **Sve na Nemačkom (`🇩🇪 DE`) + Prekidač na Srpski (`🇷🇸 SR`):** U `/chef` i `/radnik` (i unutar `AuftragsscheinModal`) podrazumevani jezik je nemački, a jednim klikom u gornjem desnom uglu sve može da se prebaci na srpski.
- [x] **Direktna ugrađena kamera u pretraživaču (`Kamera direkt öffnen`):** Pored opcije koja na mobilnom telefonu pali kameru (`capture="environment"`), dodata je i ugrađena WebRTC kamera (`navigator.mediaDevices.getUserMedia`) koja pali kameru direktno unutar samog *Auftragsschein* prozora (radi čak i na laptopu!).
- [x] **WOW animacije na početnoj stranici (`app/page.tsx` & `app/globals.css`):** Kinematografski usporeni zum (*Ken Burns*) na HD Hero slici, kaskadno pojavljivanje naslova, pulsirajući bedž, lebdeća staklena (*glassmorphism*) kartica *Geprüfte Sicherheit* i interaktivne animacije na svim karticama.

## 5. Kompletan Auftragsschein za Šefa & Popravka "Unzugewiesen" bedža (Faza 3.5 — ✅ ZAVRŠENO)
- [x] **Čuvanje kompletnog *Auftragsschein* formulara u bazi (`auftragsscheinData` u `Anfrage`):** Kada radnik u `/radnik` popuni tabelu materijala (`Menge / Einheit / Material / KFZ`), `mit`, `Zeitaufwand (von / bis / Gesamt)`, `Durchgeführte Arbeiten`, `Auftrag abgeschlossen (Ja/Nein)`, potpis klijenta (`potpisKunde`) i slike Pre/Posle, sve se čuva u bazi.
- [x] **Pristup za šefa u `/chef` panelu:** Šef sada u tabeli poslova, u sekciji *Eingereichte Auftragsscheine & Fotodokumentation* i unutar prozora za izmenu posla ima dugme **„📄 Auftragsschein“** kojim otvara ceo popunjen formular od radnika (zajedno sa potpisom klijenta i materijalom) i može ga direktno odštampati ili sačuvati kao A4 PDF.
- [x] **Popravljen prikaz bedža `⚠️ Unzugewiesen` u tabeli:** Dodat `inline-flex items-center gap-1.5 whitespace-nowrap` tako da se tekst i ikonica više nikada ne lome u dva reda.

## 6. Bezbedni Login sistem sa pravim šiframa (Šef + Radnici) (Faza 4 — ✅ ZAVRŠENO)
- [x] **Kriptovane šifre u bazi (`app/lib/password.ts`, `ChefConfig` i `Radnik.lozinkaHash`):** Sve šifre se čuvaju kao PBKDF2-SHA256 kriptovani zapisi.
- [x] **Šefov Login (`/chef`):** Pristup `/chef` panelu je zaključan lozinkom (početna šifra: `ChefETW2026!`). Šef u gornjoj traci ima dugme **`🔑 Passwörter / Šifre`** gde može da promeni svoju glavnu šifru i da bilo kom radniku postavi novu šifru ako je radnik zaboravi.
- [x] **Dodavanje novog radnika sa početnom šifrom:** Kada šef klikne na `👷+ Monteur hinzufügen`, odmah upisuje i početnu šifru za tog radnika (min. 6 znakova).
- [x] **Radnički Login i promena šifre (`/radnik`):** Radnik nakon klika na svoje ime unosi svoju ličnu šifru (početne šifre za postojeće radnike: `Marko2026!`, `Stefan2026!`, `Nikola2026!`). Kada se prijavi, radnik ima dugme **`🔑 Passwort ändern / Promeni šifru`** kojim sam može da zameni svoju lozinku.

## 7. Neograničen broj slika sa opisima, čuvanje na disku i brisanje radnika (Faza 5 — ✅ ZAVRŠENO)
- [x] **Neograničen broj slika u *Auftragsschein*-u sa opisom ispod svake slike (`AuftragsscheinModal.tsx`):** Uklonjen limit „Pre i Posle“. Radnik sada može da doda 1, 10 ili 50+ slika odjednom (`multiple`), ili da ih slika kamerom jednu po jednu, i ispod svake pojedinačne slike ima polje gde upisuje šta je uslikao (*Beschreibung / Opis slike*).
- [x] **Čuvanje slika kao pravih `.jpg` fajlova (`app/api/upload-slika/route.ts`):** Slike se automatski kompresuju na ~80 KB i čuvaju kao pravi fajlovi u `public/uploads/<posaoId>/`, tako da baza podataka nikada ne postaje opterećena čak ni sa hiljadama slika.
- [x] **Brisanje radnika (`app/api/radnik/route.ts` & `CalendarComponent.tsx`):** Šef u prozoru `🔑 Passwörter / Šifre` ima listu svih radnika i dugme **`🗑️ Monteur löschen / Obriši radnika`** kojim može da obriše radnika (njegovi poslovi se automatski vraćaju u *Unzugewiesen / Čeka na dodelu*).
- [x] **Brisanje poslatih *Auftragsschein*-ova i oslobađanje memorije (`CLEAR_AUFTRAGSSCHEIN` & `DELETE`):** Na svakoj kartici u sekciji *Eingereichte Auftragsscheine & Fotodokumentation* šef sada ima dva dugmeta za brisanje: **„🗑️ Nur Auftragsschein löschen“** (briše poslat formular i fizički briše sve slike sa diska servera, a ostavlja termin u kalendaru) i **„🗑️ Ganzen Auftrag löschen“** (kompletno briše ceo završeni posao i iz kalendara i sve njegove slike sa diska).
- [x] **Direktan skok na bilo koji datum (`📅 Datum wählen / Skok na dan`) & Kalendar bez horizontalnog skrola:**
  - Dodato polje za izbor datuma (`<input type="date" />`) odmah iznad kalendara kojim šef u 1 kliku skače na bilo koji dan (npr. za 2 meseca ili godinu dana unapred, bez kliktanja na strelicu 60 puta!).
  - U tabeli svih poslova datumi su takođe klikabilni (klik na datum u tabeli automatski prebacuje kalendar na taj dan), a u Mesečnom prikazu (`Monat`) klik na broj dana otvara `Tagesplan` za taj dan (`navLinks={true}`).
  - Uklonjen horizontalni skrol levo-desno: kalendar se uvek vidi 100% ceo na ekranu (prikazuje do 4 radnika po grupi uz dugmad `◀ Prethodna 4 | Sledeća 4 ▶` ako firma ima npr. 8 ili 10 radnika).
  - Uklonjena poruka `Your license key is invalid` (`schedulerLicenseKey="GPL-My-Project-Is-Open-Source"`).
