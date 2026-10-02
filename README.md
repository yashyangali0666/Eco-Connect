# 🌿 EcoCollect — Smart Waste Collection & Recycling Platform

> **"Dispose Smart. Collect Better. Recycle More."**  
> *Smart Waste. Cleaner Communities.*

EcoCollect is a production-grade, enterprise-ready full-stack web application designed to modernize municipal and community waste management. It seamlessly connects **Citizens**, **Collection Staff**, and **Municipal Administrators** into a unified, transparent, and data-driven ecosystem.

---

## 🌟 Table of Contents
- [Executive Overview](#-executive-overview)
- [Key Features by Role](#-key-features-by-role)
  - [Citizen Portal](#1-citizen-portal-user)
  - [Collector / Staff Portal](#2-collector--staff-portal-staff)
  - [Administrative Operations Portal](#3-administrative-operations-portal-admin)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Database Schema & State Machine](#-database-schema--state-machine)
- [REST API Specifications](#-rest-api-specifications)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Demo Credentials & Quick-Fill](#-demo-credentials--quick-fill)
- [Automated Testing & Verification](#-automated-testing--verification)
- [Docker & Containerization](#-docker--containerization)
- [Production Deployment to Google Cloud Run](#-production-deployment-to-google-cloud-run)
- [License](#-license)

---

## 🚀 Executive Overview

Traditional waste collection suffers from lack of transparency: citizens don't know proper segregation guidelines or when trucks will arrive, collectors face inefficient ad-hoc routing, and municipal leaders lack real-time visibility into collection rates and recycling benchmarks.

**EcoCollect** resolves these challenges with:
- **Smart Waste Classification**: Searchable knowledge base and AI-style segregation advisor for 8 standard waste categories.
- **Precision Geolocation Scheduling**: Leaflet & OpenStreetMap interactive pickup coordinates with automatic reverse geocoding and human-readable IDs (`EC-YYYY-XXXXXX`).
- **Live Lifecycle Tracking**: Step-by-step milestone progression from initial submission to final weigh-in and recycling confirmation.
- **Collector Dispatch & Execution**: Mobile-optimized collector dashboard with assigned routes, customer contact, and real-time status transitions.
- **Executive Analytics**: Interactive Recharts dashboards presenting status distributions, category breakdowns, 14-day collection volume trends, and carbon reduction metrics.

---

## 🎯 Key Features by Role

### 1. Citizen Portal (`USER`)
- **Interactive Landing & Discovery**: Hero introduction, real-time platform impact statistics, category previews, and benefits.
- **Smart Waste Guide**: Searchable segregation catalog featuring disposal rules, contamination hazards, and recycling guidelines.
- **5-Step Schedule Pickup Wizard**:
  - *Step 1*: Category selection with visual icons, segregation guides, and recycling tags.
  - *Step 2*: Waste quantity estimation, itemized description, and optional photo upload.
  - *Step 3*: Address auto-detection, postal code validation, and interactive Leaflet map pin placement.
  - *Step 4*: Preferred collection date picker and time slot selection (Morning / Afternoon / Evening) plus driver instructions.
  - *Step 5*: Review order summary, confirm, and receive instant confirmation with tracking link.
- **Live Milestone Tracker**: Visual progression bar displaying `SUBMITTED` ➔ `ASSIGNED` ➔ `OUT FOR PICKUP` ➔ `COLLECTED` ➔ `COMPLETED`.
- **Request Management & History**: Filter requests by active or past status, view collector details, download receipt summaries, or cancel eligible pending requests.
- **Citizen Impact Dashboard**: Personal metrics tracking total pickups, estimated kg recycled, and Eco-Credits earned.
- **Profile & Preferences**: Manage address book, phone number, and dark/light UI theme.

### 2. Collector / Staff Portal (`STAFF`)
- **Daily Route Feed**: View all active pickups assigned to the collector sorted by schedule date and proximity.
- **Operational Details**: Direct access to pickup coordinates, customer contact phone number, and special access notes.
- **Enforced Status Workflow**: Step through operational statuses with audit timestamps and collection notes:
  - `ASSIGNED` ➔ `OUT_FOR_PICKUP` (Collector in route)
  - `OUT_FOR_PICKUP` ➔ `COLLECTED` (Items loaded onto vehicle)
  - `COLLECTED` ➔ `COMPLETED` (Weighed at recycling hub & confirmed)
- **Collection Notes & Weigh-In**: Enter actual collected weight and recycling facility disposition notes.
- **Work History**: Search and filter past completed runs with customer feedback logs.

### 3. Administrative Operations Portal (`ADMIN`)
- **Executive KPI Cards**: Real-time metrics computed directly from PostgreSQL:
  - Total Pickup Requests
  - Active & In-Progress Collections
  - Completed Collections & Success Rate
  - Total Kilograms Recycled
  - Total Registered Citizens & Active Officers
- **Visual Analytics (Recharts)**:
  - *Status Distribution*: Donut chart showing real-time distribution across all 6 request states.
  - *Waste Category Breakdown*: Bar chart displaying request volume per category (Plastic, E-Waste, Organic, etc.).
  - *14-Day Collection Trends*: Gradient area chart visualizing daily collection throughput.
- **Request Management Suite**:
  - Filter by status, category, date, or search by ID (`EC-2026-XXXXXX`) or citizen name.
  - One-click **Assign Staff Modal** with real-time collector availability and vehicle capacity.
  - Administrative **Status Override Modal** with mandatory reason logging for audit compliance.
- **Collector / Staff Directory**: Add new collection officers, assign coverage zones, manage vehicle types, and monitor officer workloads.
- **User Management**: View citizen registry, verify contact information, and audit user activity.
- **Waste Category Management**: Complete CRUD operations for waste categories, disposal tips, recyclability flags, and handling guidelines.
- **System Audit Logs**: Real-time chronological audit trail of all status transitions, cancellations, and staff assignments.

---

## 🏛 System Architecture

```mermaid
graph TD
    User[Citizen Browser] <-->|HTTPS / JSON| WebServer[Express REST API :8080]
    Collector[Collector Mobile/Tablet] <-->|HTTPS / JSON| WebServer
    Admin[Admin Workstation] <-->|HTTPS / JSON| WebServer

    subgraph Backend_Container["Docker Container :8080"]
        WebServer -->|Serve SPA| ClientDist[Built React 19 Frontend]
        WebServer -->|Auth & Rate Limit| Middleware[Helmet, CORS, JWT, Zod]
        WebServer -->|ORM / SQL Queries| PrismaClient[Prisma ORM 6]
    end

    subgraph Data_Layer["Storage & External Services"]
        PrismaClient <-->|TCP / SSL| PostgresDB[(PostgreSQL 18+ Database)]
        User -.->|Map Tiles| OSM[OpenStreetMap / Carto CDN]
    end
```

---

## 💻 Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite | Fast, responsive Single Page Application (SPA) |
| **Styling & UI** | Tailwind CSS 3, Lucide Icons, Framer Motion | Modern, polished dark/light glassmorphic UI |
| **Maps & Geo** | Leaflet, React-Leaflet, OpenStreetMap | Free, interactive map picker (zero paid API keys required) |
| **Charts** | Recharts | Responsive SVG charts (Donut, Bar, Area) |
| **Backend API** | Node.js, Express, TypeScript | High-performance, typed RESTful web service |
| **Validation** | Zod | Runtime schema validation for requests and payloads |
| **Database** | PostgreSQL 18+, Prisma ORM 6 | Strictly typed relational storage with foreign keys & indexes |
| **Auth & Security** | JWT (jsonwebtoken), bcryptjs, Helmet, Express Rate Limit | Token-based authentication, salted hashing, HTTP security headers |
| **Testing** | Jest, Supertest, ts-jest | Automated integration tests for all API endpoints |
| **Deployment** | Docker (Multi-stage), Docker Compose, Google Cloud Run | Production containerization & serverless scaling |

---

## 🗄 Database Schema & State Machine

The database is built on PostgreSQL with Prisma ORM. Key entities include:

- **`User`**: Account credentials, role (`USER`, `STAFF`, `ADMIN`), full name, phone, address, and timestamps.
- **`CollectionStaffProfile`**: Linked 1-to-1 to `User` for staff members; holds employee ID, vehicle type, vehicle number, zone, and availability.
- **`WasteCategory`**: Name, slug, description, disposal guidelines, recyclability flag, icon name, and badge color.
- **`PickupRequest`**: Formatted tracking ID (`EC-YYYY-XXXXXX`), user relation, category relation, staff relation, status enum, pickup address, latitude/longitude, scheduled date, time slot, estimated & actual weight, and notes.
- **`PickupImage`**: Uploaded image attachments for waste verification.
- **`Notification`**: Real-time citizen and staff alerts with read/unread tracking.
- **`ActivityLog`**: Immutable audit logs capturing every status transition, actor ID, and metadata.
- **`Comment`**: Customer and driver communication history on specific requests.

### Request Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: Citizen schedules pickup
    PENDING --> CANCELLED: Citizen / Admin cancels
    PENDING --> ASSIGNED: Admin assigns collector
    ASSIGNED --> OUT_FOR_PICKUP: Collector starts route
    OUT_FOR_PICKUP --> COLLECTED: Collector loads waste
    COLLECTED --> COMPLETED: Hub verifies & completes
    ASSIGNED --> CANCELLED: Admin cancels
    COMPLETED --> [*]
    CANCELLED --> [*]
```

---

## 🔌 REST API Specifications

All endpoints are prefixed with `/api`. Protected routes require header: `Authorization: Bearer <JWT_TOKEN>`.

### Authentication & Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new citizen account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update user name, phone, and address |
| `GET` | `/api/users` | Admin | List all registered users with pagination |

### Waste Categories
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | List all active waste categories |
| `GET` | `/api/categories/:id` | Public | Retrieve detailed category & disposal rules |
| `POST` | `/api/categories` | Admin | Create a new category |
| `PUT` | `/api/categories/:id` | Admin | Update existing category |
| `DELETE` | `/api/categories/:id` | Admin | Soft/hard delete category |

### Pickup Requests
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/requests` | Authenticated | List requests (Citizen: own; Staff: assigned; Admin: all) |
| `GET` | `/api/requests/:id` | Authenticated | Retrieve single request details & audit trail |
| `POST` | `/api/requests` | Citizen | Create new pickup request (5-step wizard) |
| `PATCH` | `/api/requests/:id/status` | Staff / Admin | Advance status state machine with notes |
| `PATCH` | `/api/requests/:id/assign` | Admin | Assign collection staff officer |
| `POST` | `/api/requests/:id/cancel` | Citizen / Admin | Cancel eligible request with reason |

### Operations & Analytics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/staff` | Admin | List collection officers & availability |
| `POST` | `/api/staff` | Admin | Register new collection officer |
| `GET` | `/api/dashboard/stats` | Authenticated | Role-tailored dashboard metrics |
| `GET` | `/api/analytics/trends` | Admin | 14-day trends & category breakdown |
| `GET` | `/api/notifications` | Authenticated | User notification feed |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Mark notification as read |

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- [PostgreSQL](https://www.postgresql.org/) (v14+ running locally or via Docker)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/ecocollect.git
cd ecocollect

# Install root dependencies
npm install

# Install server & client dependencies
npm run install:all
```

### 2. Configure Environment Variables
Create `server/.env` (or copy from `server/.env.example`):
```env
PORT=8080
NODE_ENV=development
DATABASE_URL="postgresql://postgres:admin@localhost:5432/ecocollect?schema=public"
JWT_SECRET="ecocollect_super_secret_jwt_key_2026_production"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
CLIENT_URL="http://localhost:5173"
```

### 3. Initialize & Seed Database
Ensure PostgreSQL is running and the database `ecocollect` is created:
```bash
# Push Prisma schema to PostgreSQL
cd server
npx prisma db push

# Seed realistic categories, users, staff, and demo pickup requests
npx prisma db seed
cd ..
```

### 4. Run the Application

#### Option A: Production Mode (Unified Server)
Compile both frontend and backend and serve everything from a single port (8080):
```bash
# Build frontend and backend
npm run build

# Start production server
npm start
```
Open **`http://localhost:8080`** in your browser.

#### Option B: Development Mode (Hot Reloading)
Run backend and Vite dev server concurrently:
```bash
# In terminal 1 (Backend API on :8080)
cd server
npm run dev

# In terminal 2 (Vite Frontend with HMR on :5173)
cd client
npm run dev
```
Open **`http://localhost:5173`** in your browser. Requests to `/api` are automatically proxied to port 8080.

---

## 🔑 Demo Credentials & Quick-Fill

The login page at `/login` includes **1-Click Demo Quick-Fill Buttons** for instant evaluation:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Citizen (User)** | `user@ecocollect.demo` | `User@123` | Schedule pickups, track live milestones, view history, eco-credits |
| **Collection Staff** | `staff@ecocollect.demo` | `Staff@123` | View assigned routes, execute pickup workflow, submit weight & notes |
| **Administrator** | `admin@ecocollect.demo` | `Admin@123` | Executive KPI charts, assign staff, status overrides, category CRUD |

---

## 🧪 Automated Testing & Verification

The backend includes a comprehensive Jest + Supertest integration test suite covering authentication, authorization, request scheduling, status transitions, and data integrity:

```bash
cd server
npm test
```

### Test Coverage Results:
```
 PASS  tests/api.test.ts
  🌿 EcoCollect API Integration Test Suite
    Authentication & Authorization
      √ POST /api/auth/login - should authenticate admin successfully (52ms)
      √ POST /api/auth/login - should authenticate citizen successfully (31ms)
      √ POST /api/auth/login - should fail with invalid credentials (24ms)
      √ GET /api/auth/me - should return user profile with valid token (18ms)
      √ GET /api/auth/me - should reject request without token (11ms)
    Waste Categories
      √ GET /api/categories - should list active waste categories (15ms)
      √ POST /api/categories - should forbid non-admin from creating category (12ms)
    Pickup Request Lifecycle
      √ POST /api/requests - should allow citizen to schedule pickup (42ms)
      √ GET /api/requests - should list citizen's requests (19ms)
      √ PATCH /api/requests/:id/assign - should allow admin to assign staff (34ms)
      √ PATCH /api/requests/:id/status - should allow staff to update status to OUT_FOR_PICKUP (28ms)
      √ PATCH /api/requests/:id/status - should allow staff to update status to COLLECTED (29ms)
      √ PATCH /api/requests/:id/status - should allow staff to update status to COMPLETED (32ms)
    Dashboard & Analytics
      √ GET /api/dashboard/stats - should return citizen dashboard statistics (22ms)
      √ GET /api/dashboard/stats - should return admin platform-wide KPIs (27ms)
      √ GET /api/analytics/trends - should return 14-day trends for admin (21ms)
      √ GET /api/analytics/trends - should forbid citizen from viewing trends (13ms)

Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        1.842 s
```

---

## 🐳 Docker & Containerization

### Run with Docker Compose
A multi-service `docker-compose.yml` is provided for containerized deployment with PostgreSQL:

```bash
# Start PostgreSQL and EcoCollect app
docker compose up -d --build

# View logs
docker compose logs -f
```
The application will be live at `http://localhost:8080`.

### Build Standalone Docker Image
```bash
docker build -t ecocollect:latest .
docker run -p 8080:8080 -e DATABASE_URL="your-postgres-url" -e JWT_SECRET="your-secret" ecocollect:latest
```

---

## ☁️ Production Deployment to Google Cloud Run

EcoCollect is fully containerized and cloud-native, ready for 1-click serverless deployment on Google Cloud Run with Google Cloud SQL.

### Step-by-Step GCP Deployment Guide

#### 1. Set Up Google Cloud Project & Enable APIs
```bash
gcloud config set project YOUR_PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com
```

#### 2. Provision Cloud SQL PostgreSQL Instance
```bash
gcloud sql instances create ecocollect-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password="YourStrongDbPassword"

# Create database
gcloud sql databases create ecocollect --instance=ecocollect-db
```

#### 3. Store Secrets in Google Secret Manager
```bash
# Store DATABASE_URL with Cloud SQL socket syntax
echo -n "postgresql://postgres:YourStrongDbPassword@localhost/ecocollect?host=/cloudsql/YOUR_PROJECT_ID:us-central1:ecocollect-db" | \
  gcloud secrets create DB_URL --data-file=-

# Store JWT Secret
echo -n "super_secure_production_jwt_secret_ecocollect_2026" | \
  gcloud secrets create JWT_SECRET --data-file=-
```

#### 4. Build and Push Container to Google Artifact Registry
```bash
# Create repository
gcloud artifacts repositories create ecocollect-repo \
  --repository-format=docker \
  --location=us-central1

# Build and submit container via Cloud Build
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ecocollect-repo/ecocollect:v1 .
```

#### 5. Deploy to Google Cloud Run
```bash
gcloud run deploy ecocollect-service \
  --image=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ecocollect-repo/ecocollect:v1 \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=8080 \
  --set-secrets="DATABASE_URL=DB_URL:latest,JWT_SECRET=JWT_SECRET:latest" \
  --set-env-vars="NODE_ENV=production" \
  --add-cloudsql-instances="YOUR_PROJECT_ID:us-central1:ecocollect-db" \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10
```

Once deployment completes, Cloud Run will output your secure HTTPS URL (e.g., `https://ecocollect-service-xxxx-uc.a.run.app`).

---

## 📄 License
This project is open-source and distributed under the [MIT License](LICENSE).

---

*Built with passion for clean cities and sustainable communities.*  
**EcoCollect Team** 🌿
