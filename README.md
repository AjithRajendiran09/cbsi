# CAIAS Behavioural Style Inventory (CBSI) – Version 1.0 Pilot

Production-ready Full-Stack MERN web application built for **Christ Academy Institute for Advanced Studies (CAIAS)** to administer an empirical 40-item behavioural inventory across five dimensions to students and faculty.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Five Behavioural Dimensions](#five-behavioural-dimensions)
5. [Scoring Integrity & Engine](#scoring-integrity--engine)
6. [Project Structure](#project-structure)
7. [Getting Started & Installation](#getting-started--installation)
8. [Database Seeding](#database-seeding)
9. [Default Credentials](#default-credentials)
10. [REST API Documentation](#rest-api-documentation)
11. [Research Dataset Export](#research-dataset-export)
12. [Security & Verification](#security--verification)

---

## 1. Project Overview

The **CAIAS Behavioural Style Inventory (CBSI)** is an institutional assessment designed for educational mentoring, self-awareness, leadership development, and future psychometric research (Exploratory & Confirmatory Factor Analysis, Cronbach's alpha internal reliability testing).

### Core Principles
- **No Right or Wrong Answers**: Evaluates typical behavioural tendencies in academic and team settings.
- **4-Point Response Scale**:
  - `0` = Never
  - `1` = Rarely
  - `2` = Often
  - `3` = Almost Always
- **Non-Diagnostic**: Strictly avoids clinical, psychological, or definitive personality typing labels.

---

## 2. Key Features

- **End-to-End Multi-Step Assessment Wizard**:
  - Step 1: Introduction & Response Scale Guidance
  - Step 2: Participant Profile Verification (Student / Faculty)
  - Step 3: 40 Statements grouped across 5 dimensions with draft auto-save
  - Step 4: Completion Confirmation & Ethics Consent Declaration
- **Personalized Behavioural Profile**:
  - Score Breakdown per Dimension ($x / 24$ points, percentage)
  - Interactive Radar Chart and Horizontal Normalized Bar Chart (Recharts)
  - Predefined developmental interpretations
- **Official CAIAS Personal Report**:
  - Formatted institutional document
  - One-click **Print Report** & **Download PDF**
  - Institutional disclaimer & ethical safeguards
- **Administrative & Research Console**:
  - Live KPI statistics (Total participants, completion rates, student vs faculty breakdown)
  - Interactive Filter Panel (Department, Role, Academic Year)
  - User & Role Management (Participant, Faculty, Admin)
  - Question & Dimension Management with soft-deactivation to preserve historical assessment validity
  - Psychometric Statistical Module (Mean, Median, Standard Deviation, Range, Categorical Distributions)
  - Item-level CSV dataset export (Q1–Q40)
  - Comprehensive Audit Trail for security events

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS v3, Recharts, Lucide React, html2pdf.js, Axios
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Helmet, CORS, express-rate-limit, express-mongo-sanitize, express-validator
- **Database**: MongoDB & Mongoose ODM
- **Testing**: Jest, Supertest

---

## 4. Five Behavioural Dimensions

| Code | Dimension Name | Item Count | Max Score | Description |
| :--- | :--- | :---: | :---: | :--- |
| **LS** | Leadership & Standards | 8 | 24 | Ability to guide and uphold quality. |
| **CC** | Care & Collaboration | 8 | 24 | Interpersonal sensitivity and teamwork. |
| **AT** | Analytical Thinking | 8 | 24 | Rational decision-making and problem solving. |
| **AR** | Adaptability & Responsibility | 8 | 24 | Flexibility, accountability, and resilience. |
| **II** | Innovation & Initiative | 8 | 24 | Creativity, curiosity, and proactive behaviour. |

### Interpretation Thresholds
- **0–8**: *Developing*
- **9–16**: *Moderately Demonstrated*
- **17–24**: *Strongly Demonstrated*

---

## 5. Scoring Integrity & Engine

All scoring logic is implemented server-side in `server/services/scoringService.js`.
- The backend retrieves the active questions for the specific inventory version (`1.0`).
- Validates that every statement response has an integer score between `0` and `3`.
- Rejects incomplete submissions or invalid identifiers.
- Dynamically computes per-dimension sums ($8 \times 3 = 24$), percentages, and interpretation rules.
- Total inventory maximum is **120 points**.

---

## 6. Project Structure

```text
cbsi/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/           # Navbar, Footer, ProtectedRoute
│   │   ├── pages/
│   │   │   ├── Landing.jsx       # Public landing page
│   │   │   ├── Login.jsx         # Sign in
│   │   │   ├── Register.jsx      # Participant registration
│   │   │   ├── Dashboard.jsx     # Participant dashboard
│   │   │   ├── Assessment.jsx    # 4-step assessment wizard
│   │   │   ├── Results.jsx       # Interactive profile with charts
│   │   │   ├── Report.jsx        # Printable & PDF report
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       ├── QuestionManagement.jsx
│   │   │       ├── DimensionManagement.jsx
│   │   │       ├── AssessmentView.jsx
│   │   │       ├── Analytics.jsx
│   │   │       ├── AuditLog.jsx
│   │   │       └── ExportData.jsx
│   │   ├── context/              # AuthContext, AssessmentContext
│   │   ├── services/             # Axios API instance
│   │   ├── utils/                # Constants & scales
│   │   ├── App.jsx
│   │   └── index.css             # Tailwind design system & print rules
│   └── package.json
│
├── server/
│   ├── config/                   # db.js
│   ├── controllers/              # Auth, Assessment, Question, Admin, Export
│   ├── models/                   # User, Dimension, Question, Assessment, AuditLog
│   ├── routes/                   # Auth, Assessment, Question, Admin
│   ├── middleware/               # Auth, RBAC, RateLimiter, Validator, ErrorHandler
│   ├── services/                 # scoringService, analyticsService, exportService, auditService
│   ├── seeds/                    # seed.js (5 dimensions, 40 questions, demo admin)
│   ├── tests/                    # scoring.test.js, auth.test.js, assessment.test.js
│   ├── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 7. Getting Started & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone & Configure Environment Variables

In `cbsi/server/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/cbsi
JWT_SECRET=cbsi_dev_jwt_secret_2024_change_in_production
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Install Server Dependencies
```bash
cd cbsi/server
npm install
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

---

## 8. Database Seeding

Seed all 5 official CBSI dimensions, all 40 statements, and the default administrator account:

```bash
cd cbsi/server
npm run seed
```

---

## 9. Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@caias.in` | `Admin@123` |

*(New student participants and faculty members can register directly through the web interface).*

---

## 10. Running the Application

### Start Backend API Server:
```bash
cd cbsi/server
npm run dev
# or npm start
# Server listens at http://localhost:5000
```

### Start Frontend Vite Server:
```bash
cd cbsi/client
npm run dev
# Client is accessible at http://localhost:5173
```

---

## 11. REST API Documentation

### Public Endpoints
- `POST /api/auth/register` — Register a student or faculty account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/questions` — Retrieve active 40 statements (Version 1.0)
- `GET /api/dimensions` — Retrieve 5 dimensions and threshold rules
- `GET /api/health` — Service health check

### Participant Protected Endpoints (Bearer Token)
- `GET /api/auth/me` — Current authenticated user profile
- `POST /api/assessments` — Submit completed assessment with 40 responses & consent
- `POST /api/assessments/start` — Initialize assessment session
- `PUT /api/assessments/:id/save-progress` — Save draft responses
- `GET /api/assessments/my` — List authenticated user's assessments
- `GET /api/assessments/:id` — View specific assessment profile & scores

### Admin & Faculty Endpoints (Admin / Faculty Role)
- `GET /api/admin/dashboard` — Aggregated participation & department metrics
- `GET /api/admin/assessments` — List all participant assessments
- `GET /api/admin/analytics` — Dimension descriptive statistics (Mean, Median, Std Dev, Min, Max, Distribution)
- `GET /api/admin/export` — Download item-level raw response dataset (CSV)

### Admin Exclusive Endpoints (Admin Role)
- `GET /api/admin/users` — Search, filter, and paginate all users
- `PUT /api/admin/users/:id/role` — Update user role (participant, faculty, admin)
- `PATCH /api/admin/users/:id/status` — Activate or deactivate user account
- `POST /api/admin/questions` — Add new statement to inventory
- `PUT /api/admin/questions/:id` — Edit statement text, order, or numbering
- `PATCH /api/admin/questions/:id/status` — Soft-deactivate question
- `PATCH /api/admin/assessments/:id/reopen` — Reopen assessment for re-attempt
- `GET /api/admin/audit-logs` — Review verifiable system audit logs

---

## 12. Research Dataset Export

The administrator dataset export generates a clean CSV with:
```text
Participant_ID, Name, Role, Department, Programme, Semester, Section, Academic_Year, Q1, Q2, ..., Q40, LS, CC, AT, AR, II, Total, Assessment_Date, Inventory_Version
```
This raw data enables psychometric validation without compromising user passwords or personal identifiers.

---

## 13. Security & Verification

- **Automated Tests**:
  ```bash
  cd cbsi/server
  npm test
  ```
  Tests verify:
  - Scoring mathematical integrity ($3 \times 8 = 24$, all $0 = 0$, all $2 = 16$, total 120)
  - Missing response and out-of-range rejection
  - Password hashing & authentication
  - Assessment submission and score calculation APIs

- **Security Hardening**:
  - Helmet HTTP security headers
  - CORS origin restriction
  - Express Rate Limiting on authentication endpoints
  - MongoDB query sanitization to prevent NoSQL injection
  - Role-based authorization middleware (RBAC)
