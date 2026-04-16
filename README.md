# 🍕 Ohimà Che Pizza! — Pop Art Web Experience

Applicazione web full-stack dedicata a una pizzeria gourmet di Marina di Strongoli. Unisce la tradizione culinaria calabrese a un'estetica **Pop-Art/Neubrutalist** audace. Include la gestione dinamica del menù, una vetrina per la storia del locale e un sistema di sicurezza basato su JWT.

---

## Indice

1. [Funzionalità](#funzionalità)
2. [Tech Stack](#tech-stack)
3. [Design & Estetica](#design--estetica)
4. [Architettura](#architettura)
5. [Struttura del Progetto](#struttura-del-progetto)
6. [Prerequisiti](#prerequisiti)
7. [Installazione e Avvio](#installazione-e-avvio)
8. [Variabili d'Ambiente](#variabili-dambiente)
9. [API Endpoints](#api-endpoints)
10. [Database — Entità e Relazioni](#database--entità-e-relazioni)
11. [Sicurezza](#sicurezza)
12. [Autore](#autore)

---

## Funzionalità

### Sito Pubblico (Clienti)

| Pagina | Descrizione |
|--------|-------------|
| **Homepage** | Hero section con bottoni CTA, sezione recensioni dinamica e footer social. |
| **Menù** | Catalogo pizze (Classiche, Speciali, Bianche) caricato in tempo reale dal database. |
| **Chi Siamo** | Storytelling del brand con layout alternato (Foto/Testo) e sezione "Dove trovarci". |
| **Prenota** | Form per la prenotazione del tavolo (In fase di sviluppo). |

### Pannello Admin (Proprietario)

| Sezione | Permesso | Descrizione |
|---------|----------|-------------|
| **Menù Management** | OWNER | Aggiungi, modifica o elimina pizze, prezzi e ingredienti. |
| **Categorie** | OWNER | Gestione delle tipologie di pizze (Classiche, Speciali, ecc.). |
| **Configurazione** | OWNER | Modifica dei dati del ristorante e delle chiavi di sicurezza. |

---

## Tech Stack

| Layer | Tecnologia | Versione |
|-------|-----------|----------|
| **Backend** | Spring Boot | 4.0.0 |
| **Linguaggio** | Java | 25 |
| **Database** | PostgreSQL | — (Neon Cloud) |
| **ORM** | Hibernate / Spring Data JPA | — |
| **Sicurezza** | Spring Security 7 + JWT (jjwt 0.11.5) | — |
| **Build tool** | Maven | — |
| **Frontend** | Angular | 18+ |
| **Styling** | CSS3 (Custom Variables) | — |
| **Icone** | FontAwesome / Lucide | — |

---

## Design & Estetica

L'applicazione segue i principi del **Neubrutalism** applicato alla Pop-Art:
- **Bordi:** Neri, spessi (5px) su tutti i contenitori e bottoni.
- **Ombre:** Netto contrasto con ombre colorate e non sfumate (`box-shadow: 15px 15px 0px var(--color)`).
- **Colori:** - `Beige (#FAF8F5)` - Sfondo principale.
    - `Verde Basilico (#2D5A27)` - Dettagli e branding.
    - `Rosso Pomodoro (#D32F2F)` - Call to action e prezzi.
- **Tipografia:** **Bungee** per i titoli (stile comic/bold) e **Inter** per il corpo del testo.

---

## Architettura

┌─────────────────────────────┐
│         FRONTEND            │
│    Angular 18 (SPA)         │
│    Porta 4200               │
└──────────┬──────────────────┘
│ Chiamate REST
▼
┌──────────────────────────────────────────────────┐
│                   BACKEND                        │
│  Spring Boot 4 / Java 25                         │
│  REST API — Porta 8080                           │
│  JWT Authentication + Spring Security            │
└──────────┬───────────────────────────────────────┘
│ JPA/Hibernate
▼
┌──────────────────────────────┐
│       PostgreSQL (Neon)      │
│  Cloud Managed Database      │
└──────────────────────────────┘

---

## Struttura del Progetto

ohima-che-pizza/
│
├── frontend/                          # Sorgenti Angular
│   ├── src/app/
│   │   ├── components/                # Navbar, Hero, Menu-List
│   │   ├── pages/                     # Home, About, Menu, Booking
│   │   ├── services/                  # Collegamento alle API Java
│   │   └── styles.css                 # Variabili colori e stile Pop-Art
│   └── public/                        # Asset (Logo, Immagini Hero)
│
├── src/main/java/com/example/Food_delivery_management_backend/
│   ├── controller/                    # Endpoint API (Menu, Auth, ecc.)
│   ├── entity/                        # Entità JPA (MenuItem, Restaurant, User)
│   ├── repository/                    # Interfacce Spring Data JPA
│   ├── security/                      # Configurazione JWT e filtri
│   └── service/                       # Logica di business
│
├── src/main/resources/
│   └── application.properties         # Configurazione DB e JWT
└── pom.xml                            # Dipendenze Maven


---

## Prerequisiti

- **Java JDK 25**
- **Node.js** (v18+)
- **Maven**
- Un'istanza di **PostgreSQL** (consigliato Neon.tech)

---

## Installazione e Avvio

### 1. Configurazione Backend
Nel file `src/main/resources/application.properties`, configura il database e la chiave JWT:
```properties
spring.datasource.url=jdbc:postgresql://tuo-url-neon/neondb
spring.datasource.username=tuo_utente
spring.datasource.password=tua_password
jwt.secret=TuaChiaveSegretaMoltoLungaPerJWT
Avvia il backend da IntelliJ o terminale:

Bash
mvn spring-boot:run
2. Configurazione Frontend

Entra nella cartella frontend e avvia il server di sviluppo:

Bash
cd frontend
npm install
npm start

```

Variabile,Descrizione
DB_URL,Endpoint PostgreSQL di Neon.tech
JWT_SECRET,Stringa segreta per la firma dei token (min 32 char)
JWT_EXPIRATION,Durata della sessione admin

API Endpoints
Pubblici

GET /api/menu-items/restaurant/1 — Recupera il menù completo.

GET /api/restaurants/1/contacts — Contatti del locale.

POST /api/auth/login — Autenticazione admin.

Protetti (Solo OWNER)

POST /api/menu-items/restaurant/1/bulk — Caricamento massivo pizze.

PUT /api/restaurants/1 — Modifica info ristorante.

Database — Entità e Relazioni
Restaurant: 1:1 con l'Owner (User).

Restaurant: 1:N con MenuItem (Le pizze del menù).

MenuItem: N:1 con la Category (Classiche, Speciali, ecc.).

Sicurezza
Password Hashing: BCrypt per la protezione delle credenziali owner.

Autenticazione: Stateless tramite JWT (JSON Web Token).

CORS: Configurato per accettare richieste esclusivamente dal frontend Angular (Porta 4200).

Filtri: JwtAuthenticationFilter intercetta ogni richiesta protetta per validare il token nell'Header.

Autore
Dario Elia

GitHub: @darioeliaaa

Progetto: Ohimà Che Pizza! - Esperimento Full-Stack Java/Angular.


Ti piace? Ho inserito anche i segnaposto per i diagrammi (`[Image of...]`) che GitHub renderizzerà bene se aggiungerai degli schemi, e ho strutturato la matrice delle funzionalità proprio come l'esempio che mi hai dato!

C'è qualche altra sezione che vuoi approfondire o passiamo alla prossima missione?
