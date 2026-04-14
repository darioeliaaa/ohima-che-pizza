# ✨ Gestionale Centro Estetico — Bella Vita

Applicazione web full-stack per la gestione completa di un centro estetico: servizi, prodotti, prenotazione via WhatsApp, orari di apertura e galleria fotografica. Include un sito pubblico per i clienti e un pannello di amministrazione protetto con sistema di sicurezza multilivello (WebAuthn/FIDO2 + passkey testuale + ruoli differenziati).

---

## Indice

1. [Funzionalità](#funzionalità)
2. [Tech Stack](#tech-stack)
3. [Architettura](#architettura)
4. [Struttura del Progetto](#struttura-del-progetto)
5. [Prerequisiti](#prerequisiti)
6. [Installazione e Avvio](#installazione-e-avvio)
7. [Variabili d'Ambiente](#variabili-dambiente)
8. [API Endpoints](#api-endpoints)
9. [Database — Entità e Relazioni](#database--entità-e-relazioni)
10. [Sicurezza](#sicurezza)
11. [Frontend — Pagine e Componenti](#frontend--pagine-e-componenti)
12. [Riutilizzare solo il Backend](#riutilizzare-solo-il-backend)
13. [Autore](#autore)

---

## Funzionalità

### Sito Pubblico (Clienti)

| Pagina | Descrizione |
|--------|-------------|
| **Homepage** | Hero con immagine, punti di forza, orari dinamici, contatti, sezione "Scrivi una recensione" Google |
| **Servizi** | Catalogo trattamenti con filtri per categoria e sezione (Viso, Corpo, Unghie…), toggle disponibilità |
| **Prodotti** | Catalogo prodotti beauty con filtri per categoria, brand, ricerca e prezzi |
| **Prenota** | Prenotazione via WhatsApp con verifica automatica disponibilità (orari + chiusure) |
| **Chi siamo** | Storia del centro, galleria fotografica con filtri (ambiente/centro/trattamenti), lightbox |

### Pannello Admin (Proprietario)

| Sezione | Permesso | Descrizione |
|---------|----------|-------------|
| **Servizi** | OWNER | Aggiungi trattamenti con immagine/prezzo/durata/categoria/sezione, attiva/disattiva disponibilità |
| **Prodotti** | OWNER | Gestisci catalogo prodotti beauty (nome, brand, prezzo, categoria, immagine) |
| **Categorie Prodotti** | OWNER | Crea, modifica, elimina categorie prodotti con immagine e ordine |
| **Categorie Servizi** | OWNER | Gestisci categorie trattamenti (Viso, Corpo, Unghie, Capelli…) |
| **Sezioni Servizi** | OWNER | Gestisci sezioni servizi con icone dedicate |
| **Chi siamo** | OWNER | Modifica contenuto testuale, gestisci galleria fotografica |
| **Amministratori** | OWNER | Crea/elimina utenti admin — protetto da WebAuthn |
| **Orari** | OWNER | Imposta orari apertura per ogni giorno + giorni di chiusura straordinaria |
| **Impostazioni** | OWNER | Modifica contatti centro estetico, numero WhatsApp + gestione passkey biometriche |

---

## Tech Stack

| Layer | Tecnologia | Versione |
|-------|-----------|----------|
| **Backend** | Spring Boot | 4.0.0 |
| **Linguaggio** | Java | 21 |
| **Database** | PostgreSQL | — (Neon Cloud) |
| **ORM** | Hibernate / Spring Data JPA | — |
| **Sicurezza** | Spring Security 7 + JWT (jjwt 0.11.5) + BCrypt + WebAuthn/FIDO2 | — |
| **Build tool** | Maven (wrapper incluso) | — |
| **Utility** | Lombok 1.18.38 | — |
| **CBOR** | Jackson Dataformat CBOR (per attestation WebAuthn) | — |
| **Email** | Spring Boot Starter Mail (Gmail SMTP) | — |
| **Frontend** | React | 19 |
| **Bundler** | Vite | 8 |
| **CSS** | Tailwind CSS | 4 |
| **Icone** | Lucide React | 1.7 |
| **Routing** | React Router | 7 |

---

## Architettura

```
┌─────────────────────────────┐
│         FRONTEND            │
│  React 19 + Vite + Tailwind │
│  porta 5173                 │
└──────────┬──────────────────┘
           │ proxy /api →
           ▼
┌──────────────────────────────────────────────────┐
│                   BACKEND                        │
│  Spring Boot 4 / Java 21                         │
│  REST API — porta 8080                           │
│  JWT + Spring Security 7 + WriteProtectionFilter │
│  WebAuthn/FIDO2 + Rate Limiting                  │
└──────────┬───────────────────────────────────────┘
           │ JPA/Hibernate
           ▼
┌──────────────────────────────┐
│       PostgreSQL (Neon)      │
│  Schema creato automaticamente│
│  con ddl-auto=update         │
└──────────────────────────────┘
```

Il frontend comunica col backend **solo** tramite API REST (`/api/*`). Il proxy Vite redirige tutte le chiamate `/api` verso `localhost:8080`. Frontend e backend sono completamente disaccoppiati.

---

## Struttura del Progetto

```
Progetto/
│
├── avvia.sh / chiudi.sh / esponi.sh   # Script per avviare, fermare, esporre
├── mvnw / mvnw.cmd                    # Maven Wrapper
├── pom.xml                            # Dipendenze Maven
├── .env.example                       # Template variabili d'ambiente
│
├── src/main/java/com/example/Food_delivery_management_backend/
│   ├── FoodDeliveryManagementBackendApplication.java
│   ├── controller/
│   │   ├── AuthController.java           # Login, admin CRUD, passkey testuale + rate limiting
│   │   ├── WebAuthnController.java       # WebAuthn/FIDO2 (registrazione, autenticazione)
│   │   ├── RestaurantController.java     # Registrazione centro, contatti
│   │   ├── MenuItemController.java       # CRUD servizi/trattamenti
│   │   ├── MenuCategoryController.java   # CRUD categorie servizi
│   │   ├── MenuSectionController.java    # CRUD sezioni servizi
│   │   ├── ProductController.java        # CRUD prodotti beauty
│   │   ├── ProductCategoryController.java # CRUD categorie prodotti
│   │   ├── AboutController.java          # CRUD contenuto "Chi siamo" + galleria
│   │   ├── ScheduleController.java       # Orari e chiusure
│   │   ├── FileUploadController.java     # Upload immagini
│   │   └── GlobalExceptionHandler.java   # Gestione errori centralizzata
│   ├── dto/                      # Request/Response DTO con @Valid
│   ├── entity/                   # Entità JPA
│   │   ├── Restaurant, User, MenuItem, MenuCategory, MenuSection
│   │   ├── Product, ProductCategory
│   │   ├── OpeningHours, ClosingDay
│   │   ├── AboutContent, AboutGalleryItem
│   │   └── WebAuthnCredential
│   ├── repository/               # Spring Data JPA Repositories
│   ├── service/                  # Logica di business
│   └── security/
│       ├── SecurityConfig.java           # CORS, filtri, permessi
│       ├── WriteProtectionFilter.java    # Protezione scrittura per ruolo
│       └── jwt/
│           ├── JwtUtil.java              # Genera/valida token JWT
│           └── JwtAuthenticationFilter.java
│
├── src/main/resources/
│   └── application.properties    # Configurazione (tutte le variabili esternalizzate)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Router principale
│   │   ├── components/
│   │   │   ├── PublicLayout.jsx / PublicNavbar.jsx
│   │   │   ├── AdminLayout.jsx       # Layout admin + PasskeyModal globale
│   │   │   ├── AdminSidebar.jsx      # Sidebar con permessi per ruolo
│   │   │   ├── OwnerRoute.jsx        # Guard per rotte solo-owner
│   │   │   └── PasskeyModal.jsx      # Modal verifica passkey (WebAuthn + testuale)
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx       # Sessione JWT + stato verifica owner
│   │   ├── pages/
│   │   │   ├── public/               # 5 pagine clienti
│   │   │   └── admin/                # 10 pagine amministrazione
│   │   └── services/
│   │       └── api.js                # Chiamate HTTP + gestione errori write-protection
│   └── public/                       # Asset statici
│
└── uploads/                          # Immagini caricate dagli utenti
```

---

## Prerequisiti

| Software | Versione minima | Note |
|----------|----------------|------|
| **Java JDK** | 21 | Verificare con `java -version` |
| **Node.js** | 18+ | Verificare con `node -v` |
| **npm** | 9+ | Incluso con Node.js |
| **PostgreSQL** | — | Il progetto usa Neon Cloud (non serve installazione locale) |
| **Maven** | — | **Non serve** — il Maven Wrapper (`mvnw`) è incluso |

---

## Installazione e Avvio

### 1. Configurazione ambiente

```bash
cp .env.example .env
# Compilare .env con i propri valori (DB, JWT_SECRET, OWNER_PASSKEY, ecc.)
```

### 2. Avvio rapido (script automatico)

```bash
chmod +x avvia.sh
./avvia.sh
```

Lo script avvia backend e frontend contemporaneamente e li ferma entrambi con `Ctrl+C`.

### 3. Avvio manuale

```bash
# Backend (porta 8080)
./mvnw spring-boot:run

# Frontend (porta 5173, in un altro terminale)
cd frontend && npm install && npm run dev
```

### 4. Accesso

| URL | Descrizione |
|-----|-------------|
| `http://localhost:5173` | Sito pubblico |
| `http://localhost:5173/admin/login` | Login amministratore |
| `http://localhost:8080/api/*` | API REST dirette |

Al primo avvio, Hibernate crea tutte le tabelle automaticamente (`ddl-auto=update`).

Per registrare il centro estetico + account owner:

```bash
curl -X POST http://localhost:8080/api/restaurants/register \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantName": "Bella Vita Centro Estetico",
    "address": "Via Roma 1",
    "phone": "123456789",
    "zipCode": "00100",
    "ownerEmail": "owner@email.it",
    "ownerPassword": "Password123!",
    "ownerName": "Nome Cognome"
  }'
```

---

## Variabili d'Ambiente

Tutte le configurazioni sensibili sono esternalizzate tramite variabili d'ambiente. Il file `.env.example` nella root documenta ogni variabile.

| Variabile | Obbligatoria | Descrizione |
|-----------|:---:|-------------|
| `DB_URL` | ✅ | URL connessione PostgreSQL (es. `jdbc:postgresql://host:5432/db?sslmode=require`) |
| `DB_USERNAME` | ✅ | Utente database |
| `DB_PASSWORD` | ✅ | Password database |
| `JWT_SECRET` | ✅ | Chiave segreta per firmare i token JWT (min. 256 bit / 32 caratteri) |
| `JWT_EXPIRATION` | ❌ | Durata token in ms (default: `3600000` = 1 ora) |
| `OWNER_PASSKEY` | ✅ | Passkey testuale di recovery — supporta **plain text** o **hash BCrypt** (consigliato) |
| `EMAIL_USERNAME` | ❌ | Email Gmail per invio notifiche |
| `EMAIL_APP_PASSWORD` | ❌ | App Password Gmail |
| `APP_BASE_URL` | ❌ | URL base per link nelle email (default: `http://localhost:8080`) |
| `WEBAUTHN_RP_ID` | ❌ | Relying Party ID per WebAuthn (default: `localhost`) |
| `WEBAUTHN_RP_NAME` | ❌ | Nome visualizzato nel prompt biometrico (default: `Centro Estetico Manager`) |
| `WEBAUTHN_RP_ORIGINS` | ❌ | Origins consentiti per WebAuthn, separati da virgola |

> **Nota**: nessun segreto è hardcoded nel codice. Il file `.env` è escluso da git tramite `.gitignore`.

---

## API Endpoints

### Pubblici (nessuna autenticazione)

```
POST   /api/auth/login                                  # Login → JWT
POST   /api/restaurants/register                         # Registra centro + owner
GET    /api/restaurants/{id}                             # Dettaglio centro
GET    /api/restaurants/{id}/contacts                    # Contatti + WhatsApp
GET    /api/menu-items/restaurant/{restaurantId}         # Servizi/trattamenti
GET    /api/menu-categories/restaurant/{restaurantId}    # Categorie servizi
GET    /api/menu-sections/restaurant/{restaurantId}      # Sezioni servizi
GET    /api/products/restaurant/{restaurantId}           # Prodotti beauty
GET    /api/product-categories/restaurant/{restaurantId} # Categorie prodotti
GET    /api/schedule/hours/{restaurantId}                # Orari apertura
GET    /api/schedule/closing-days/{restaurantId}         # Giorni chiusura
GET    /api/schedule/check/{restaurantId}?date=&time=    # Verifica disponibilità
GET    /api/about/{restaurantId}                         # Contenuto "Chi siamo"
GET    /api/about/{restaurantId}/gallery                 # Galleria fotografica
GET    /api/uploads/{filename}                           # File caricato
```

### Protetti — Configurazione (solo OWNER verificato)

Queste operazioni richiedono che l'owner abbia completato la verifica passkey (WebAuthn o testuale). Per gli ADMIN restituiscono `403 ADMIN_READ_ONLY`.

```
# Servizi/Trattamenti
POST   /api/menu-items
PATCH  /api/menu-items/{id}/availability

# Categorie servizi
POST   /api/menu-categories/{restaurantId}
PUT    /api/menu-categories/{id}
DELETE /api/menu-categories/{id}

# Sezioni servizi
POST   /api/menu-sections/{restaurantId}
PUT    /api/menu-sections/{id}
DELETE /api/menu-sections/{id}

# Prodotti
POST   /api/products/{restaurantId}
PATCH  /api/products/{id}/availability
DELETE /api/products/{id}

# Categorie prodotti
POST   /api/product-categories/{restaurantId}
PUT    /api/product-categories/{id}
DELETE /api/product-categories/{id}

# Orari e Chiusure
POST   /api/schedule/hours/{restaurantId}
POST   /api/schedule/closing-days/{restaurantId}
DELETE /api/schedule/closing-days/{id}

# Chi siamo
PUT    /api/about/{restaurantId}
POST   /api/about/{restaurantId}/gallery
DELETE /api/about/gallery/{id}

# Impostazioni (contatti + WhatsApp)
PUT    /api/restaurants/{id}/contacts

# Upload
POST   /api/uploads
```

### Protetti — Solo OWNER

```
# Gestione admin
GET    /api/auth/admins
POST   /api/auth/admins
DELETE /api/auth/admins/{id}

# Verifica passkey
POST   /api/auth/owner/verify-passkey          # Verifica passkey testuale
GET    /api/auth/owner/verification-status      # Stato verifica corrente
POST   /api/auth/owner/revoke-verification      # Revoca verifica

# WebAuthn/FIDO2
POST   /api/auth/webauthn/register/options      # Ottieni challenge registrazione
POST   /api/auth/webauthn/register/complete      # Completa registrazione passkey
POST   /api/auth/webauthn/authenticate/options   # Ottieni challenge autenticazione
POST   /api/auth/webauthn/authenticate/complete  # Completa autenticazione
GET    /api/auth/webauthn/credentials            # Lista passkey registrate
DELETE /api/auth/webauthn/credentials/{id}       # Elimina passkey
GET    /api/auth/webauthn/has-credentials        # Verifica esistenza passkey
```

---

## Database — Entità e Relazioni

```
Restaurant (centro estetico)
 ├── 1:1  User (OWNER)
 ├── 1:N  User (ADMIN, creati dall'owner)
 ├── 1:N  MenuCategory (categorie servizi: Viso, Corpo, Unghie…)
 ├── 1:N  MenuSection (sezioni servizi)
 ├── 1:N  MenuItem (servizi/trattamenti) ──── N:1 MenuCategory, N:1 MenuSection
 ├── 1:N  ProductCategory (categorie prodotti)
 ├── 1:N  Product (prodotti beauty) ──── N:1 ProductCategory
 ├── 1:N  OpeningHours (orari giornalieri)
 ├── 1:N  ClosingDay (chiusure straordinarie)
 ├── 1:1  AboutContent (testo "Chi siamo")
 │         └── 1:N  AboutGalleryItem (foto galleria)
 └── User (OWNER)
      └── 1:N  WebAuthnCredential (passkey biometriche)
```

### Entità principali

| Entità | Campi chiave |
|--------|------|
| `Restaurant` | id, name, address, phone, email, whatsappNumber, zipCode, status |
| `User` | id, email, password (BCrypt), role (OWNER/ADMIN), restaurant_id |
| `MenuItem` | id, name, description, price, imageUrl, type, available, preparationTime, restaurant_id, category_id, section_id |
| `MenuCategory` | id, name, displayOrder, restaurant_id |
| `MenuSection` | id, name, displayOrder, restaurant_id |
| `Product` | id, productName, brand, description, price, imageUrl, isAvailable, restaurant_id, category_id |
| `ProductCategory` | id, name, imageUrl, displayOrder, restaurant_id |
| `OpeningHours` | id, dayOfWeek (1-7), openTime, closeTime, isClosed, restaurant_id |
| `ClosingDay` | id, date, reason, restaurant_id |
| `AboutContent` | id, title, description, restaurant_id |
| `AboutGalleryItem` | id, imageUrl, caption, category, displayOrder, about_id |
| `WebAuthnCredential` | id, credentialId, publicKey, algorithm, signatureCount, name, user_id |

Tutte le entità usano `@Version` per **optimistic locking** (protezione da conflitti concorrenti).

---

## Sicurezza

### Panoramica

| Livello | Meccanismo | Dettaglio |
|---------|------------|-----------|
| **Autenticazione** | JWT (HS256) | Token stateless, scadenza 1 ora |
| **Password** | BCrypt | Hash one-way con salt |
| **Ruoli** | `OWNER` / `ADMIN` | Differenziazione permessi granulare |
| **2° Fattore (owner)** | WebAuthn/FIDO2 | Passkey biometrica (Touch ID, Face ID, Windows Hello) |
| **Recovery** | Passkey testuale | BCrypt + rate limiting (5 tentativi / 15 min) |
| **Write Protection** | `WriteProtectionFilter` | Filtro centralizzato che blocca scritture non autorizzate |
| **CORS** | Spring Security | Origins configurabili via variabili d'ambiente |
| **Validazione** | `@Valid` + Bean Validation | Su tutti i DTO in ingresso |
| **Locking** | Optimistic (`@Version`) | Su tutte le entità |
| **Upload** | Validazione tipo + dimensione | Max 1MB per file, 2MB per request |

### Matrice permessi

| Operazione | ADMIN | OWNER (non verificato) | OWNER (verificato) |
|------------|:-----:|:---------------------:|:------------------:|
| Visualizzare tutto | ✅ | ✅ | ✅ |
| Modificare servizi/categorie/sezioni | ❌ | ❌ (modale passkey) | ✅ |
| Gestire prodotti/categorie prodotti | ❌ | ❌ (modale passkey) | ✅ |
| Modificare orari | ❌ | ❌ (modale passkey) | ✅ |
| Modificare "Chi siamo" | ❌ | ❌ (modale passkey) | ✅ |
| Gestire admin | ❌ | ❌ (modale passkey) | ✅ |
| Registrare nuove passkey | ❌ | ✅ (solo prima passkey) | ✅ |
| Eliminare passkey | ❌ | ❌ (modale passkey) | ✅ |

### Stile grafico

- **Tema scuro** con sfondo `stone-950` e accenti `amber-500`
- Font: **Playfair Display** (titoli) + **Inter** (corpo)
- Card con effetto **glass** (`backdrop-blur` + bordi semitrasparenti)
- Animazioni CSS, transizioni hover, modal con backdrop blur
- Footer con icone social (Instagram, Facebook)
- Fully responsive (mobile-first)

---

## Riutilizzare solo il Backend

Il backend è un'API REST pura, completamente disaccoppiata dal frontend.

### Cosa copiare

```
├── mvnw, mvnw.cmd, .mvn/       # Maven Wrapper
├── pom.xml                      # Dipendenze
├── src/                         # Codice Java completo
├── .env.example                 # Template configurazione
```

### Setup

1. Copiare i file sopra in una nuova repository
2. Creare un database PostgreSQL (o usare Neon Cloud)
3. Compilare un `.env` con le proprie variabili
4. Avviare con `./mvnw spring-boot:run`
5. Registrare il centro via API (`POST /api/restaurants/register`)
6. Costruire il frontend con qualsiasi tecnologia

---

## Autore

**Francesco Pio Ceraudo**
