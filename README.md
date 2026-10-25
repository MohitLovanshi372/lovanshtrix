# LOVANSTRIX — Ideas Into Innovation (Full-Stack MERN Application)

**Lovanstrix** is a full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** digital innovation and IT services platform built with modern JavaScript (ES Modules), React 19 JSX, Tailwind CSS, Mongoose, and Express.

- **Founder & CEO:** Mohit Lovanshi
- **Tagline:** Ideas Into Innovation.

---

## 1. Technology Stack

- **Database:** MongoDB with Mongoose ODM (`server/models/index.js`) + automatic synchronized local JSON fallback (`data/lovanstrix-store.json`) when `MONGODB_URI` is not configured
- **Backend API:** Node.js + Express.js (`server/app.js`, `server/routes/apiRoutes.js`, `server/controllers/*`)
- **Frontend:** React 19 (`.jsx` ES Modules), Vite, Tailwind CSS, Motion, Lucide Icons, Three.js (`Interactive3DCore.jsx`), jsPDF (`pdfGenerator.js`)
- **Security:** Timing-safe `ADMIN_PASSCODE` authentication (minimum 12 characters), rate limiting on sensitive endpoints, private resume binary storage outside public static directories, honeypot spam protection, and strict input sanitization

---

## 2. Project Structure

```text
lovanshtrix/
├── index.html                        # HTML5 entry point loading /src/main.jsx
├── package.json                      # Unified scripts & dependencies (ES Modules)
├── server.js                         # Root Node.js server entry point
├── vite.config.js                    # Vite configuration (JavaScript ES Module)
├── .env.example                      # Documented environment variable template
├── data/
│   ├── lovanstrix-store.json         # Seeded & synchronized JSON store
│   ├── backups/                      # Automatic timestamped pre-migration backups
│   └── private-resumes/              # Private binary storage for uploaded resumes
├── scripts/
│   ├── migrate-json-to-mongodb.js    # Idempotent JSON -> MongoDB migration utility
│   └── validate-codebase.js          # Syntax & zero-TypeScript verification script
├── server/
│   ├── app.js                        # Express app setup + Vite middleware
│   ├── server.js                     # Database connection + HTTP server bootstrap
│   ├── config/
│   │   ├── env.js                    # Environment variables & path constants
│   │   └── db.js                     # Mongoose connection & health status manager
│   ├── models/
│   │   └── index.js                  # 14 Mongoose schemas & models with indexes
│   ├── controllers/
│   │   ├── publicController.js       # Health, public store, enquiries, careers, verify
│   │   ├── internshipController.js   # Internship applications & student tracking
│   │   └── adminController.js        # Admin auth, store management, resume downloads
│   ├── middleware/
│   │   ├── auth.js                   # Timing-safe ADMIN_PASSCODE verification
│   │   ├── security.js               # Security headers & IP rate limiters
│   │   └── errorHandler.js           # Standardized JSON 404 & error handlers
│   ├── routes/
│   │   └── apiRoutes.js              # Express REST API router (/api/*)
│   ├── services/
│   │   ├── storeService.js           # Dual MongoDB + JSON store persistence service
│   │   └── emailService.js           # Optional Nodemailer SMTP notification service
│   └── utils/
│       └── validators.js             # Input sanitization, validation, and redaction
└── src/
    ├── main.jsx                      # React DOM entry point
    ├── App.jsx                       # Main application & navigation shell
    ├── index.css                     # Tailwind CSS & custom visual styles
    ├── types/
    │   └── lovanstrix.js             # Initial seed data & store defaults
    ├── utils/
    │   └── pdfGenerator.js           # Offer letter & completion certificate PDF engine
    └── components/
        ├── AdminConsoleSection.jsx
        ├── AdminInternshipsSection.jsx
        ├── BrandVisuals.jsx
        ├── CareersSection.jsx
        ├── CertificateVerificationSection.jsx
        ├── ContactQuoteSection.jsx
        ├── DocumentPreviewModal.jsx
        ├── Interactive3DCore.jsx
        ├── InternshipPortalSection.jsx
        ├── ServiceDetailView.jsx
        ├── SolutionsSection.jsx
        └── StudentDashboardSection.jsx
```

---

## 3. Environment Configuration

Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

| Variable | Required | Description |
| :--- | :--- | :--- |
| `PORT` | Optional | Server port (defaults to `3000`) |
| `NODE_ENV` | Optional | `development` or `production` |
| `MONGODB_URI` | Recommended | MongoDB Atlas or local connection string (`mongodb://127.0.0.1:27017/lovanstrix`) |
| `MONGODB_DB_NAME` | Optional | Database name (defaults to `lovanstrix`) |
| `ADMIN_PASSCODE` | **Required for Admin** | Passcode of **at least 12 characters** to unlock `/api/admin/*` endpoints |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Optional | SMTP credentials for email alerts on new enquiries |

---

## 4. Running Locally & Migrating Data to MongoDB

### Install Dependencies
```bash
npm install
```

### Validate & Preview JSON-to-MongoDB Migration (Dry Run)
Validates `data/lovanstrix-store.json`, creates a timestamped backup in `data/backups/`, and previews collection counts without requiring a live MongoDB connection:
```bash
npm run migrate:mongodb:dry-run
```

### Execute Live Migration to MongoDB
Once `MONGODB_URI` is set in `.env`, run the idempotent migration script to upsert all company settings, services, solutions, projects, explorations, career openings, enquiries, career submissions, internships, applications, offer letters, certificates, and private resumes into MongoDB:
```bash
npm run migrate:mongodb
```

### Start Development Server
Runs Express + Vite middleware on `http://localhost:3000`:
```bash
npm run dev
```

### Production Build & Start
```bash
npm run build
npm start
```

---

## 5. REST API Reference

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server & MongoDB connection health status |
| `GET` | `/api/store` | Public | Public website content (sensitive records redacted) |
| `POST` | `/api/enquiries` | Public (Rate-limited) | Submit a project / quote enquiry |
| `POST` | `/api/careers/apply` | Public (Rate-limited) | Submit a career / talent pool application |
| `POST` | `/api/internships/apply` | Public (Rate-limited) | Submit an internship application |
| `POST` | `/api/internships/track` | Public (Rate-limited) | Track internship status by Application ID + Email |
| `GET` | `/api/certificates/verify/:code` | Public (Rate-limited) | Verify a completion certificate by Certificate ID |
| `POST` | `/api/admin/verify` | Rate-limited | Verify `ADMIN_PASSCODE` |
| `GET` | `/api/admin/store` | `x-admin-passcode` | Retrieve full unredacted store for Admin Console |
| `PUT` | `/api/store` | `x-admin-passcode` | Update company profile, services, projects, and records |
| `GET` | `/api/admin/resumes/:kind/:id` | `x-admin-passcode` | Download a private candidate resume binary |
