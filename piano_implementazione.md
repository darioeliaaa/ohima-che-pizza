# Trasformazione Ristorante → Centro Estetico + Produzione-Ready

Trasformare il sistema di gestione ristorante esistente (Spring Boot 4 + React/Vite + TailwindCSS 4) in un sito web completo per centro estetico, pronto per la distribuzione.

## User Review Required

> [!IMPORTANT]
> **Nome del centro estetico**: Serve un nome per il centro estetico (es. "Centro Estetico Bella Vita"). Lo useremo per title tag, hero, footer, ecc. **Per ora userò un placeholder "Centro Estetico Bella Vita"** — dimmi il nome reale e lo cambio.

> [!IMPORTANT]
> **Numero WhatsApp**: Quale numero di telefono configurare per il link WhatsApp delle prenotazioni? Per ora lo lascio configurabile da admin nelle impostazioni.

> [!WARNING]
> **Database**: La trasformazione modifica entity e tabelle. Se usi lo stesso DB del ristorante, i dati esistenti saranno persi. Consiglio un DB separato.

---

## Panoramica delle Modifiche

Il progetto mantiene la stessa architettura (Spring Boot backend + React frontend), ma viene adattato per un centro estetico con queste sezioni:

| Sezione Pubblica | Descrizione |
|---|---|
| **Home** | Hero centro estetico, servizi in vetrina, orari, contatti, CTA prenotazione WhatsApp |
| **Servizi** | Lista servizi organizzati per categorie/sezioni (come il menu del ristorante) |
| **Prodotti** | **NUOVA** — Catalogo prodotti in vendita in negozio, con categorie |
| **Prenotazioni** | Form data/ora + composizione messaggio WhatsApp (niente DB) |
| **Chi Siamo** | Carosello con gallery gestibile da admin (già esistente) |

| Sezione Admin | Descrizione |
|---|---|
| **Servizi** | Gestione servizi (rinominato da "Menu") |
| **Categorie Servizi** | Categorie dei servizi (rinominato da "Categorie") |
| **Sezioni Servizi** | Sezioni dei servizi (rinominato da "Sezioni") |
| **Prodotti** | **NUOVO** — CRUD prodotti con categorie |
| **Categorie Prodotti** | **NUOVO** — Categorie per i prodotti |
| **Orari** | Gestione apertura/chiusura (invariato) |
| **Chi Siamo** | Gestione carosello (invariato) |
| **Impostazioni** | Contatti + numero WhatsApp + Passkey |
| **Amministratori** | Gestione admin (invariato) |

---

## Proposed Changes

### Componente 1: Backend — Nuova Entity `Product` + `ProductCategory`

#### [NEW] Product.java
`src/main/java/com/example/Food_delivery_management_backend/entity/Product.java`

Nuova entity per i prodotti venduti dal centro estetico:
- `id`, `restaurant` (FK), `name`, `description`, `price`, `imageUrl`, `isAvailable`
- `category` (String), `brand` (String opzionale)
- Timestamps `createdAt`, `updatedAt`

#### [NEW] ProductCategory.java
`src/main/java/com/example/Food_delivery_management_backend/entity/ProductCategory.java`

Categorie per i prodotti:
- `id`, `restaurant` (FK), `name`, `description`, `imageUrl`, `displayOrder`

#### [NEW] ProductRepository.java / ProductCategoryRepository.java

Repository JPA standard con query per `restaurantId`.

#### [NEW] ProductService.java / ProductCategoryService.java

Service layer con CRUD completo.

#### [NEW] ProductController.java / ProductCategoryController.java

REST controller:
- `GET /api/products/restaurant/{id}` — lista prodotti (pubblico)
- `POST /api/products` — crea prodotto (admin)
- `PATCH /api/products/{id}/availability` — toggle disponibilità
- `DELETE /api/products/{id}` — elimina prodotto
- `GET /api/product-categories/restaurant/{id}` — lista categorie prodotti (pubblico)
- `POST /api/product-categories/{restaurantId}` — crea categoria
- `PUT /api/product-categories/{id}` — modifica categoria
- `DELETE /api/product-categories/{id}` — elimina categoria

---

#### [MODIFY] [Restaurant.java](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/src/main/java/com/example/Food_delivery_management_backend/entity/Restaurant.java)

Aggiungere campo `whatsappNumber` (String, length 20) per il numero WhatsApp delle prenotazioni.

#### [MODIFY] [RestaurantController.java](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/src/main/java/com/example/Food_delivery_management_backend/controller/RestaurantController.java)

Esporre `whatsappNumber` nell'endpoint `/contacts` e permetterne l'aggiornamento.

#### [MODIFY] [SecurityConfig.java](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/src/main/java/com/example/Food_delivery_management_backend/security/SecurityConfig.java)

- Aggiungere endpoint pubblici per prodotti e categorie prodotti (`/api/products/restaurant/**`, `/api/product-categories/restaurant/**`)
- Aggiungere **security headers** per produzione:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security` (HSTS)
  - `Content-Security-Policy` base
  - `Referrer-Policy: strict-origin-when-cross-origin`

#### [MODIFY] [WriteProtectionFilter.java](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/src/main/java/com/example/Food_delivery_management_backend/security/WriteProtectionFilter.java)

Aggiungere `/api/products` e `/api/product-categories` ai path di configurazione protetti.

#### [MODIFY] [application.properties](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/src/main/resources/application.properties)

- Rinominare nome applicazione da "Food-delivery" a "beauty-center-backend"
- Aggiungere configurazione HSTS e security headers
- Aggiungere `server.servlet.session.cookie.secure=true` e `server.servlet.session.cookie.http-only=true`

---

### Componente 2: Frontend — Pagine Pubbliche

#### [MODIFY] [index.html](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/index.html)

- Cambiare `<title>` da "Trattoria da Ciccio" a "Centro Estetico Bella Vita"
- Aggiungere meta description, Open Graph tags, theme-color per SEO

#### [MODIFY] [index.css](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/index.css)

- Cambiare color scheme: da toni ambra/stone (ristorante) a toni **rosa/viola/gold** (centro estetico)
- Aggiungere nuove animazioni e stili glass per il tema beauty

#### [MODIFY] [HomePage.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/pages/public/HomePage.jsx)

Riscrittura completa per centro estetico:
- Hero con immagine beauty/spa, nome centro, CTA "Prenota su WhatsApp" e "I nostri servizi"
- Sezione "Perché sceglierci" con icone beauty (Sparkles, Heart, Star)
- Sezione orari + contatti con design aggiornato
- Sezione CTA prenotazione WhatsApp
- Sezione "Come arrivare" (invariata logica, aggiornato testo)

#### [MODIFY] [MenuPage.jsx → ServicesPage.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/pages/public/MenuPage.jsx)

Rinominato in `ServicesPage.jsx` — adattato lessico (piatti → servizi, menu → trattamenti):
- Categorie con splash screen (invariato meccanismo)
- Card servizi con prezzo, durata (usa `preparationTime` come durata in minuti)
- Testi/icone beauty

#### [NEW] ProductsPage.jsx
`frontend/src/pages/public/ProductsPage.jsx`

Nuova pagina catalogo prodotti:
- Header con immagine beauty products
- Grid prodotti organizzati per categoria
- Card prodotto: immagine, nome, descrizione, prezzo, brand
- Filtro per categoria
- Design coerente con il tema centro estetico

#### [MODIFY] [ReservationPage.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/pages/public/ReservationPage.jsx)

Riscrittura per sistema WhatsApp:
- Form: nome cliente, data, orario, tipo di trattamento (opzionale), note
- Gli orari disponibili si basano sugli opening hours da admin (GET schedario)
- Pulsante "Prenota su WhatsApp" che compone un `https://wa.me/{numero}?text={messaggio_precompilato}`
- Il messaggio include: nome, data, ora, trattamento, note
- **Nessuna chiamata POST al backend**, solo client-side
- Controllo disponibilità pre-invio con `checkAvailability` (se il centro è chiuso, blocca)

#### [MODIFY] [GalleryPage.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/pages/public/GalleryPage.jsx)

- Aggiornare testi default (da ristorante/territorio a centro estetico/trattamenti)
- Aggiornare categorie galleria (territorio → ambiente, ristorante → centro, piatti → trattamenti)
- Aggiornare immagini fallback con temi beauty

#### [DELETE] [PromotionsPage.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/pages/public/PromotionsPage.jsx) + [MyReservationsPage.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/pages/public/MyReservationsPage.jsx)

Rimossi: le promozioni non servono per il centro estetico, e le prenotazioni sono via WhatsApp (niente DB lato client).

---

### Componente 3: Frontend — Pagine Admin

#### [MODIFY] [AdminSidebar.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/components/AdminSidebar.jsx)

Aggiornare link sidebar:
- "Menu" → "Servizi" + icona Sparkles
- Aggiungere "Prodotti" + icona ShoppingBag
- Aggiungere "Categorie Prodotti" + icona Package
- Rimuovere "Tavoli", "Conti", "Prenotazioni"
- Rinominare icone/label per contesto beauty

#### [MODIFY] [MenuAdminPage.jsx → ServicesAdminPage.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/pages/admin/MenuAdminPage.jsx)

Rinominato e adattato:
- "Piatto" → "Servizio/Trattamento"
- "Prezzo" rimane, "Tempo preparazione" → "Durata (min)"
- Form aggiornato per servizi beauty

#### [NEW] ProductsAdminPage.jsx
`frontend/src/pages/admin/ProductsAdminPage.jsx`

Pagina CRUD prodotti:
- Tabella prodotti con immagine, nome, categoria, prezzo, brand, disponibilità
- Form creazione con upload immagine
- Toggle disponibilità

#### [NEW] ProductCategoriesAdminPage.jsx
`frontend/src/pages/admin/ProductCategoriesAdminPage.jsx`

Pagina gestione categorie prodotti:
- Lista categorie con nome, descrizione, immagine
- CRUD completo

#### [MODIFY] [CategoriesAdminPage.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/pages/admin/CategoriesAdminPage.jsx)

Rinominare label da "menu" a "servizi".

#### [MODIFY] [SectionsAdminPage.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/pages/admin/SectionsAdminPage.jsx)

Rinominare label da "menu" a "servizi".

#### [MODIFY] [SettingsPage.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/pages/admin/SettingsPage.jsx)

Aggiungere campo "Numero WhatsApp" nelle impostazioni contatti.

#### [DELETE] Pagine non necessarie:
- [TablesPage.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/pages/admin/TablesPage.jsx) — tavoli non servono
- [BillsPage.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/pages/admin/BillsPage.jsx) — conti non servono
- [ReservationsPage.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/pages/admin/ReservationsPage.jsx) — prenotazioni via WhatsApp

---

### Componente 4: Frontend — Navigazione e Layout

#### [MODIFY] [App.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/App.jsx)

Aggiornare routes:
- `/menu` → `/servizi` (ServicesPage)
- `/prenota` → `/prenota` (ReservationPage rivisitata WhatsApp)
- `/prodotti` → ProductsPage (NUOVA)
- Rimuovere `/promozioni`, `/le-mie-prenotazioni`
- Admin: rimuovere `tavoli`, `conti`, `prenotazioni`; aggiungere `prodotti`, `categorie-prodotti`

#### [MODIFY] [PublicNavbar.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/components/PublicNavbar.jsx)

Aggiornare link:
- Home, Servizi, Prodotti, Prenota, Chi Siamo
- Logo aggiornato

#### [MODIFY] [PublicLayout.jsx](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/components/PublicLayout.jsx)

- Footer aggiornato per centro estetico
- Testi, social links, copyright aggiornati
- Navigazione footer aggiornata

#### [MODIFY] [api.js](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/src/services/api.js)

Aggiungere chiamate API per i prodotti:
- `getProducts(restaurantId)`
- `createProduct(data)`
- `toggleProductAvailability(id, available)`
- `deleteProduct(id)`
- `getProductCategories(restaurantId)`
- `createProductCategory(restaurantId, data)`
- `updateProductCategory(id, data)`
- `deleteProductCategory(id)`

---

### Componente 5: Sicurezza e Produzione

#### [MODIFY] [SecurityConfig.java](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/src/main/java/com/example/Food_delivery_management_backend/security/SecurityConfig.java)

Aggiungere **HTTP Security Headers** per produzione:

```java
.headers(headers -> headers
    .contentTypeOptions(withDefaults())      // X-Content-Type-Options: nosniff
    .frameOptions(frame -> frame.deny())     // X-Frame-Options: DENY
    .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
    .httpStrictTransportSecurity(hsts -> hsts
        .includeSubDomains(true)
        .maxAgeInSeconds(31536000))          // HSTS 1 anno
    .referrerPolicy(referrer -> referrer
        .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
    .permissionsPolicy(permissions -> permissions
        .policy("camera=(), microphone=(), geolocation=()"))
)
```

#### [MODIFY] [application.properties](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/src/main/resources/application.properties)

Aggiungere configurazioni per produzione:
```properties
# Cookie Security
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=lax

# Compression
server.compression.enabled=true
server.compression.mime-types=application/json,text/html,text/css,application/javascript
server.compression.min-response-size=1024
```

#### [MODIFY] CORS Configuration

Restringere allowed origins da `*` a origini specifiche (configurabili via env).

#### [MODIFY] [vite.config.js](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/vite.config.js)

Aggiungere output directory per build di produzione e configurazione proxy.

---

### Componente 6: SEO e Meta

#### [MODIFY] [index.html](file:///Users/francescoceraudo/Desktop/Progetto_Ristoranti_Strongoli/frontend/index.html)

```html
<meta name="description" content="Centro Estetico Bella Vita — Trattamenti viso e corpo, manicure, pedicure e prodotti di bellezza. Prenota il tuo appuntamento.">
<meta name="keywords" content="centro estetico, trattamenti bellezza, manicure, pedicure, skin care">
<meta property="og:title" content="Centro Estetico Bella Vita">
<meta property="og:description" content="Trattamenti di bellezza e benessere. Prenota su WhatsApp.">
<meta property="og:type" content="website">
<meta name="theme-color" content="#be185d">
<link rel="canonical" href="https://www.tuodominio.it/">
```

---

## Piano di Rimozione

Questi file/feature del ristorante **verranno rimossi dalla UI** ma le entity/controller backend rimangono (non fanno danno e mantengono retrocompatibilità):

| Rimosso dal Frontend | Motivazione |
|---|---|
| `TablesPage.jsx` | Niente tavoli in un centro estetico |
| `BillsPage.jsx` | Niente conti DB |
| `ReservationsPage.jsx` (admin) | Prenotazioni via WhatsApp |
| `PromotionsPage.jsx` (public) | Non richiesto |
| `PromotionsAdminPage.jsx` (admin) | Non richiesto |
| `MyReservationsPage.jsx` | Non ci sono prenotazioni DB |
| `AngularWidgetPage.jsx` | Dashboard non necessaria |

---

## Riepilogo File da Creare/Modificare

### Backend (Java)
| Azione | File |
|---|---|
| NEW | `entity/Product.java` |
| NEW | `entity/ProductCategory.java` |
| NEW | `repository/ProductRepository.java` |
| NEW | `repository/ProductCategoryRepository.java` |
| NEW | `service/ProductService.java` |
| NEW | `service/ProductCategoryService.java` |
| NEW | `controller/ProductController.java` |
| NEW | `controller/ProductCategoryController.java` |
| MODIFY | `entity/Restaurant.java` (+ whatsappNumber) |
| MODIFY | `controller/RestaurantController.java` |
| MODIFY | `security/SecurityConfig.java` (headers + products endpoints) |
| MODIFY | `security/WriteProtectionFilter.java` (+ products paths) |
| MODIFY | `application.properties` |

### Frontend (React)
| Azione | File |
|---|---|
| NEW | `pages/public/ProductsPage.jsx` |
| NEW | `pages/public/ServicesPage.jsx` (riscrittura MenuPage) |
| NEW | `pages/admin/ProductsAdminPage.jsx` |
| NEW | `pages/admin/ProductCategoriesAdminPage.jsx` |
| MODIFY | `App.jsx` (routes) |
| MODIFY | `index.html` (SEO) |
| MODIFY | `index.css` (theme beauty) |
| MODIFY | `services/api.js` (+ products API) |
| MODIFY | `components/PublicNavbar.jsx` |
| MODIFY | `components/PublicLayout.jsx` (footer) |
| MODIFY | `components/AdminSidebar.jsx` |
| MODIFY | `pages/public/HomePage.jsx` (riscrittura beauty) |
| MODIFY | `pages/public/ReservationPage.jsx` (WhatsApp) |
| MODIFY | `pages/public/GalleryPage.jsx` (testi beauty) |
| MODIFY | `pages/admin/MenuAdminPage.jsx` → rinominato ServicesAdminPage |
| MODIFY | `pages/admin/CategoriesAdminPage.jsx` (label) |
| MODIFY | `pages/admin/SectionsAdminPage.jsx` (label) |
| MODIFY | `pages/admin/SettingsPage.jsx` (+ WhatsApp field) |
| DELETE-ROUTE | `TablesPage`, `BillsPage`, `ReservationsPage`, `PromoAdmin`, `AngularWidget` |
| DELETE-ROUTE | `PromotionsPage`, `MyReservationsPage` (public) |

---

## Verification Plan

### Automated Tests
1. `./mvnw compile` — verifica compilazione backend
2. `cd frontend && npm run build` — verifica build frontend
3. Browser test: navigare tutte le pagine pubbliche e verificare UI
4. Browser test: verificare area admin con navigazione sidebar

### Manual Verification
- Controllare che il form prenotazione componga correttamente il link WhatsApp
- Verificare che la pagina prodotti mostri i prodotti da backend
- Verificare che gli header di sicurezza HTTP siano presenti nelle response
- Verificare che il tema beauty sia applicato coerentemente
