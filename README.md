# 🌉 FoodBridge: Food Waste Redistribution Network

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

FoodBridge is a full-stack, production-style platform designed to eliminate edible food waste by connecting food donors (restaurants, hotels, hostels, canteens, bakeries, event organizers) with verified Non-Governmental Organizations (NGOs) and community delivery volunteers.

---

## 📋 Table of Contents
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [System Architecture & Workflow](#-system-architecture--workflow)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start Guide](#-quick-start-guide)
  - [Option A: Instant Dev Mode (H2 In-Memory DB — Zero Docker Required)](#option-a-instant-dev-mode-h2-in-memory-db--zero-docker-required)
  - [Option B: Production Mode (Docker Compose with MySQL 8 & MailHog)](#option-b-production-mode-docker-compose-with-mysql-8--mailhog)
- [Pre-seeded Demo Accounts](#-pre-seeded-demo-accounts)
- [Step-by-Step End-to-End Walkthrough](#-step-by-step-end-to-end-walkthrough)
- [Running Automated Tests](#-running-automated-tests)
- [API Documentation & Swagger UI](#-api-documentation--swagger-ui)
- [Security & Business Rules](#-security--business-rules)
- [Environmental Impact Formula](#-environmental-impact-formula)
- [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🌟 Key Features

### 1. Donor Portal
- Post surplus food listings with category, quantity, servings, dietary tags, pickup address, GPS coordinates (latitude/longitude), and expiry window.
- Upload real photos of prepared food or packaged grocery items.
- Food safety certification and temperature check acknowledgments.
- Track real-time status of donations (`AVAILABLE` ➔ `CLAIMED` ➔ `ASSIGNED` ➔ `PICKED_UP` ➔ `DELIVERED`).
- Dynamic single-use **Pickup QR Code** generation for contactless verification with volunteers.

### 2. NGO Portal
- Real-time surplus food discovery via **Interactive Map (Leaflet / OpenStreetMap)** and sortable list view.
- Haversine distance-based radius filtering (5 km, 10 km, 25 km, 50 km).
- Fast 1-click food claim flow.
- Dynamic single-use **Delivery QR Code** generation for confirming receipt from volunteers.
- NGO impact metrics dashboard (total meals claimed, beneficiaries fed, food saved in kg).

### 3. Volunteer Portal
- Browse available pickup tasks from claimed food donations.
- Single active task limit enforcement (volunteers cannot hoard multiple concurrent deliveries).
- Built-in camera **QR Code Scanner** (`html5-qrcode`) with manual token code fallback for desktop testing.
- Two-stage milestone verification:
  1. Scan Donor's Pickup QR ➔ Updates status to `PICKED_UP`.
  2. Scan NGO's Delivery QR ➔ Updates status to `DELIVERED`.
- Personal volunteer leaderboard and delivery history log.

### 4. Admin Portal
- Platform-wide impact metrics: Total Donations, Active Rescues, Completed Deliveries, Weight Diverted, and CO₂ Emissions Avoided.
- NGO verification management: Review uploaded registration certificates and approve/reject NGO profiles.
- User management and system audit log.
- Analytics charts with category breakdown and monthly distribution trends powered by **Recharts**.

### 5. Automated Background Services
- Scheduled background cron job (`@Scheduled(cron = "0 */5 * * * *")`) scanning for expired surplus food and auto-transitioning uncollected listings to `EXPIRED`.
- Automated email notification triggers on key lifecycle events (Claim confirmation, Volunteer assignment, Delivery completed).

---

## 🛠️ Architecture & Tech Stack

```
+-------------------------------------------------------------+
|                      React 18 SPA                           |
|   Vite + TypeScript + Tailwind CSS + Lucide Icons + Recharts|
|   Leaflet OpenStreetMap + html5-qrcode Camera Scanner       |
+-------------------------------------------------------------+
                              |
                     REST APIs (Axios + JWT)
                              |
+-------------------------------------------------------------+
|                 Spring Boot 3.3.5 Backend                   |
|   Java 21 + Spring Security 6 (Stateless JWT Bearer)        |
|   Spring Data JPA (Hibernate) + Bean Validation             |
|   ZXing 3.5.3 (QR Code Generation) + Springdoc OpenAPI 2.6  |
|   Spring Task Scheduler + JavaMailSender (MailHog)          |
+-------------------------------------------------------------+
           |                                       |
    [dev profile]                           [prod profile]
+----------------------+                 +--------------------+
|  H2 In-Memory DB     |                 |  MySQL 8 Container |
|  (MySQL Compatibility|                 |  (Docker Compose)  |
|   Mode - Zero Setup) |                 +--------------------+
+----------------------+
```

### Backend:
- **Language**: Java 21 (LTS)
- **Framework**: Spring Boot 3.3.5
- **Security**: Spring Security 6 + JJWT 0.12.6 (Stateless Bearer Tokens)
- **ORM & Database**: Spring Data JPA / Hibernate, H2 Database (dev), MySQL 8 (prod)
- **QR Code Engine**: ZXing (`core` & `javase` 3.5.3)
- **Documentation**: Springdoc OpenAPI / Swagger UI 2.6.0
- **Testing**: JUnit 5, Mockito, Spring Security Test, MockMvc

### Frontend:
- **Core**: React 18.3, TypeScript 5.5, Vite 5.4
- **Routing**: React Router v6
- **Styling**: Tailwind CSS 3.4, PostCSS, Autoprefixer, Lucide React icons
- **State & Data**: React Context API, Axios with automatic JWT Authorization interceptor
- **Mapping**: Leaflet 1.9, React-Leaflet 4.2, OpenStreetMap tiles
- **Charts**: Recharts 2.13
- **Scanning**: `html5-qrcode` 2.3.8

---

## 📐 Project Directory Structure

```
foodbridge/
├── docker-compose.yml              # MySQL 8 & MailHog services
├── README.md                       # Master documentation & user guide
├── backend/
│   ├── pom.xml                     # Maven project descriptor (Java 21, Spring Boot 3.3.5)
│   ├── .env.example                # Sample environment variables
│   ├── uploads/                    # Local storage directory for donation photos
│   └── src/
│       ├── main/
│       │   ├── java/com/foodbridge/
│       │   │   ├── FoodBridgeApplication.java   # App entrypoint (@EnableScheduling)
│       │   │   ├── config/                      # WebMvcConfig, OpenApiConfig, DataInitializer
│       │   │   ├── controller/                  # 8 REST Controllers
│       │   │   ├── dto/                         # Request & Response Data Transfer Objects
│       │   │   ├── entity/                      # 7 JPA Entities & Enums
│       │   │   ├── exception/                   # GlobalExceptionHandler & custom exceptions
│       │   │   ├── repository/                  # 7 Spring Data JPA Repositories
│       │   │   ├── security/                    # JwtProvider, Filter, UserPrincipal, SecurityConfig
│       │   │   └── service/                     # Business logic services & scheduled tasks
│       │   └── resources/
│       │       └── application.yml              # Dev (H2) and Prod (MySQL) configurations
│       └── test/java/com/foodbridge/            # Integration & unit test suites
└── frontend/
    ├── package.json                # Dependencies & scripts
    ├── vite.config.ts              # Vite configuration with proxy
    ├── tailwind.config.js          # Tailwind CSS styling configuration
    ├── tsconfig.json               # TypeScript compiler config
    └── src/
        ├── main.tsx                # React DOM entrypoint
        ├── App.tsx                 # Client routing & layout structure
        ├── api/client.ts           # Axios instance & typed API service modules
        ├── context/AuthContext.tsx # User session, token storage & RBAC helpers
        ├── types/index.ts          # Central TypeScript interfaces & enum mappings
        ├── components/             # Reusable UI components (Navbar, Footer, Modals, Badges)
        └── pages/                  # Public, Donor, NGO, Volunteer & Admin view pages
```

---

## ⚡ Prerequisites

To run FoodBridge on Windows, macOS, or Linux, ensure you have:
1. **Java Development Kit (JDK) 21** installed and configured on your path (`java -version`).
2. **Node.js** (v18.0.0 or higher) and **npm** (`node -v` and `npm -v`).
3. *(Optional)* **Docker Desktop** if you wish to run the production MySQL 8 and MailHog containers.

---

## 🚀 Quick Start Guide (Easiest & Fastest)

### 🌟 Option 1: One-Click Launch (Recommended for Windows)

In the root `foodbridge` directory, simply **double-click**:
👉 **`start-all.bat`**

This will automatically launch:
1. **Spring Boot Backend** in its own command window (`http://localhost:8080`)
2. **React Frontend** in its own command window (`http://localhost:5173`)

*(Or run `.\start-all.bat` or `.\start-all.ps1` from your terminal).*

---

### Option 2: Running Backend & Frontend Individually

#### Step 1: Start the Spring Boot Backend

You have three easy ways to run the backend:

- **Method A (Double-click batch file)**:
  Double-click `foodbridge\start-backend.bat`.

- **Method B (Direct Java — Zero Maven required)**:
  Open a terminal in `foodbridge/backend` and run:
  ```powershell
  java -jar target\foodbridge-backend-1.0.0.jar
  ```

- **Method C (Using Maven Wrapper `mvnw.cmd`)**:
  ```powershell
  cd "c:\Users\Bhagyesh\OneDrive\Desktop\SIH Project ME\foodbridge\backend"
  .\mvnw.cmd spring-boot:run
  ```

*The backend will boot up on `http://localhost:8080`, initialize an in-memory H2 database in MySQL compatibility mode, and seed all 5 demo accounts and initial surplus donations.*

#### Step 2: Start the React Frontend

- **Method A (Double-click batch file)**:
  Double-click `foodbridge\start-frontend.bat`.

- **Method B (Terminal command)**:
  ```powershell
  cd "c:\Users\Bhagyesh\OneDrive\Desktop\SIH Project ME\foodbridge\frontend"
  cmd.exe /c npm run dev
  ```
  *(Note: Using `cmd.exe /c npm run dev` avoids PowerShell script execution policy restrictions).*

*Open your browser and navigate to `http://localhost:5173`.*

---

### Option B: Production Mode (Docker Compose with MySQL 8 & MailHog)

#### Step 1: Start Docker Services
Open PowerShell in the root `foodbridge` directory:
```powershell
cd "c:\Users\Bhagyesh\OneDrive\Desktop\SIH Project ME\foodbridge"
docker-compose up -d
```
*This launches:*
- **MySQL 8** on port `3306` (database: `foodbridge`, user: `foodbridge`, password: `foodbridge_password`)
- **MailHog** SMTP on port `1025` and Web Mailbox UI on `http://localhost:8025`

#### Step 2: Run Backend with Production Profile
```powershell
cd "c:\Users\Bhagyesh\OneDrive\Desktop\SIH Project ME\foodbridge\backend"
& "C:\Users\Bhagyesh\.antigravity-ide\extensions\oracle.oracle-java-26.0.2-universal\nbcode\java\maven\bin\mvn.cmd" spring-boot:run -Dspring-boot.run.profiles=prod
```

#### Step 3: Run Frontend
```powershell
cd "c:\Users\Bhagyesh\OneDrive\Desktop\SIH Project ME\foodbridge\frontend"
npm run dev
```

---

## 👥 Pre-seeded Demo Accounts

The application automatically seeds 5 complete persona accounts upon startup with ready-to-test privileges:

| Role | Email Address | Password | Permissions & State |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@foodbridge.local` | `Admin@123` | Platform analytics, NGO verification, user management |
| **Food Donor** | `donor@foodbridge.local` | `Donor@123` | Post donations, track listings, display Pickup QR code |
| **Verified NGO** | `ngo@foodbridge.local` | `Ngo@123` | Radius search, claim surplus food, display Delivery QR |
| **Volunteer** | `volunteer@foodbridge.local` | `Volunteer@123` | Accept pickups, scan Pickup & Delivery QRs |
| **Unverified NGO** | `unverified-ngo@foodbridge.local` | `Ngo@123` | Test pending verification banner and access restrictions |

> 💡 **Tip:** On the Login page (`/login`), click on any role button at the bottom to automatically fill in the demo credentials with 1 click!

---

## 🔄 Step-by-Step End-to-End Walkthrough

Follow this full cycle to experience the complete FoodBridge redistribution workflow:

```
[1. Donor Posts Food] ──► [2. NGO Claims Food] ──► [3. Volunteer Accepts Task]
                                                            │
                                                            ▼
[5. NGO Shows Delivery QR] ◄── [4. Donor Shows Pickup QR & Volunteer Scans]
            │
            ▼
[6. Volunteer Scans Delivery QR] ──► [7. Impact Stats Update Platform-wide]
```

### Step 1: Donor Posts Surplus Food
1. Log in as `donor@foodbridge.local` / `Donor@123`.
2. Click **"Post Food Donation"** in the top navigation or dashboard.
3. Fill out the details:
   - Food Title: *“Freshly Prepared Buffet Meals”*
   - Category: *Prepared Meals*
   - Quantity & Servings: *25 kg, 60 servings*
   - Prepared Time: Today, 2 hours ago
   - Expiry Time: Today, 6 hours from now
   - Location: *Downtown Community Kitchen (12.9716, 77.5946)*
   - Check the **Food Safety & Quality Certification** checkbox.
4. Click **"Publish Donation"**. Status is now `AVAILABLE`.

### Step 2: NGO Discovers and Claims Food
1. Log out or open an Incognito window, then log in as `ngo@foodbridge.local` / `Ngo@123`.
2. Go to **"Find Food"**.
3. Toggle between the **List View** and **Interactive Map View**.
4. Adjust the radius filter (e.g., 25 km) to see matching surplus listings.
5. Click **"Claim Food"** on the donor listing.
6. The donation status transitions to `CLAIMED`.

### Step 3: Volunteer Accepts Pickup Assignment
1. Log in as `volunteer@foodbridge.local` / `Volunteer@123`.
2. Go to **"Available Pickups"**.
3. Find the claimed donation and click **"Accept Delivery Task"**.
4. The system assigns the task and transitions the donation to `ASSIGNED`.
   *(Note: The volunteer now has 1 active task. If they try to claim another, the platform enforces the single active task limit).*

### Step 4: Donor Shows Pickup QR & Volunteer Scans
1. Switch back to the **Donor** window (`donor@foodbridge.local`).
2. Go to **"My Listings"** and click **"View Details & QR"** on the assigned donation.
3. Click **"Show Pickup QR"**. A high-contrast QR code and an 8-character manual code (e.g., `PK-A1B2C3D4`) appear on screen.
4. Switch to the **Volunteer** window (`volunteer@foodbridge.local`) and go to **"QR Scanner"** or click **"Scan Pickup QR"** on the task card.
5. Use your webcam or enter the 8-character manual code into the token input box and click **"Verify Code"**.
6. Status instantly updates to `PICKED_UP`.

### Step 5: NGO Shows Delivery QR & Volunteer Scans
1. Switch to the **NGO** window (`ngo@foodbridge.local`).
2. Go to **"Claimed Food"** and click **"Receive Delivery (Show QR)"**.
3. A single-use **Delivery QR Code** with its token code (e.g., `DL-9Z8Y7X6W`) is displayed.
4. Switch to the **Volunteer** window (`volunteer@foodbridge.local`).
5. Open the **QR Scanner**, select **Delivery Verification**, and scan the QR or submit the code.
6. Status updates to `DELIVERED`!

### Step 6: Platform Impact Metrics Update
1. Log in as `admin@foodbridge.local` / `Admin@123`.
2. Check the platform dashboard:
   - Total Deliveries incremented.
   - Food Saved (kg) incremented.
   - Meals Distributed incremented.
   - CO₂ Emissions Reduced (kg) automatically calculated.

---

## 🧪 Running Automated Tests

### Backend Unit & Integration Tests
The backend includes a comprehensive JUnit 5 and MockMvc test suite testing authentication, role-based authorization, claim business logic, single active task enforcement, and QR verification:

```powershell
cd "c:\Users\Bhagyesh\OneDrive\Desktop\SIH Project ME\foodbridge\backend"
& "C:\Users\Bhagyesh\.antigravity-ide\extensions\oracle.oracle-java-26.0.2-universal\nbcode\java\maven\bin\mvn.cmd" test
```

**Test Coverage Highlights:**
- `AuthFlowTest`: User registration, password encoding, JWT generation, login verification.
- `DonationWorkflowTest`: Complete donation creation, validation constraints, and listing lifecycle.
- `NgoClaimRulesTest`: Verified NGO claiming rules, unverified NGO claim rejections (`403 Forbidden`), donor claiming own food prevention (`400 Bad Request`).
- `VolunteerPickupAndQrTest`: Task assignment, single active task limit enforcement, valid QR milestone transitions, invalid/tampered QR code rejection.

### Frontend Typecheck and Production Build
```powershell
cd "c:\Users\Bhagyesh\OneDrive\Desktop\SIH Project ME\foodbridge\frontend"
npm run build
```

---

## 📖 API Documentation & Swagger UI

When the backend is running, the interactive OpenAPI Swagger UI documentation is available at:
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

### Core Endpoints Summary:

| Group | Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register new user & organization profile | Public |
| | `POST` | `/api/auth/login` | Authenticate & retrieve JWT token | Public |
| | `GET` | `/api/auth/me` | Fetch current authenticated user profile | Authenticated |
| **Donations**| `POST` | `/api/donations` | Create new surplus food listing | DONOR |
| | `GET` | `/api/donations` | Search & filter listings (status, distance, category) | Public |
| | `GET` | `/api/donations/{id}` | Get detailed donation record | Public |
| | `GET` | `/api/donations/my` | Retrieve logged-in donor's listings | DONOR |
| **Claims** | `POST` | `/api/claims/donations/{id}` | Claim surplus food donation | VERIFIED NGO |
| | `GET` | `/api/claims/my` | Get claims for logged-in NGO | NGO |
| **Pickups** | `GET` | `/api/pickups/available` | Get claimed donations waiting for pickup | VOLUNTEER |
| | `POST` | `/api/pickups/claims/{id}/accept`| Accept delivery task (max 1 active) | VOLUNTEER |
| | `GET` | `/api/pickups/my-tasks` | Get volunteer's assigned tasks | VOLUNTEER |
| **QR Engine**| `GET` | `/api/qr/pickup/{claimId}` | Generate/retrieve Donor Pickup QR code | DONOR / ADMIN |
| | `GET` | `/api/qr/delivery/{claimId}` | Generate/retrieve NGO Delivery QR code | NGO / ADMIN |
| | `POST` | `/api/qr/verify-pickup` | Verify pickup QR token | VOLUNTEER |
| | `POST` | `/api/qr/verify-delivery`| Verify delivery QR token | VOLUNTEER |
| **Admin** | `GET` | `/api/admin/pending-ngos` | Retrieve NGOs awaiting verification | ADMIN |
| | `PUT` | `/api/admin/ngos/{id}/verify`| Approve or reject NGO status | ADMIN |
| | `GET` | `/api/admin/analytics` | Retrieve detailed system statistics | ADMIN |

---

## 🛡️ Security & Business Rules

1. **Role-Based Access Control (RBAC)**: All endpoints are protected by Spring Security method security (`@PreAuthorize`) and URL security rules.
2. **NGO Verification Guard**: Only NGOs with `verificationStatus = VERIFIED` are permitted to claim food donations. Pending or unverified NGOs receive an informative error and are prompted to await admin approval.
3. **Single Active Volunteer Task**: A volunteer can only have **one** active task in progress (`ASSIGNED` or `PICKED_UP`) at any time. This prevents hoarding and delivery delays.
4. **Single-Use Cryptographic QR Codes**:
   - Separate tokens are generated for Pickup and Delivery milestones.
   - Tokens are validated for expiration and can only be scanned once.
   - Tampered or reused tokens are rejected with descriptive error responses.
5. **Auto-Expiry Cleanup**: A scheduled cron task automatically inspects and updates unclaimed donations whose `expiryTime` has elapsed to status `EXPIRED`.

---

## 🌿 Environmental Impact Formula

FoodBridge quantifies community and ecological benefits using standard environmental benchmarks:

$$\text{Meals Saved} = \sum \text{numberOfServings for all } \texttt{DELIVERED} \text{ donations}$$

$$\text{Food Diverted (kg)} = \sum \text{estimatedWeightKg for all } \texttt{DELIVERED} \text{ donations}$$

$$\text{CO}_2\text{ Reduction (kg)} = \text{Food Diverted (kg)} \times 2.5$$

*(Every 1 kg of edible food rescued prevents approximately 2.5 kg of greenhouse gas CO₂ equivalents that would otherwise be released in landfills).*

---

## ☁️ Production & Cloud Deployment Guide

FoodBridge is architected with complete containerization, 1-click cloud platform blueprints, and production Docker configurations.

```
                           +-------------------------------+
                           |      Vercel / Netlify CDN     |
                           |   (React 18 SPA + Vite Build) |
                           +-------------------------------+
                                           │
                                HTTPS REST │ (with Bearer JWT)
                                           ▼
                           +-------------------------------+
                           |   Render / Railway Container  |
                           |    (Spring Boot 3.3.5 / JRE)  |
                           +-------------------------------+
                                           │
                                     JDBC  │ (Connection Pool)
                                           ▼
                           +-------------------------------+
                           |    Managed MySQL 8 Database   |
                           +-------------------------------+
```

---

### Option 1: 100% Free Cloud Deployment (Vercel + Render)

This is the recommended deployment pattern for college presentations and capstone projects. It requires **no credit card** and runs 24/7 on free-tier infrastructure.

#### Step 1: Push Code to GitHub
Ensure your FoodBridge monorepo is pushed to a GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit of FoodBridge platform"
git branch -M main
git remote add origin https://github.com/<your-username>/foodbridge.git
git push -u origin main
```

#### Step 2: Deploy Backend & Database on Render
1. Sign up for a free account at [Render.com](https://render.com).
2. Click **New +** ➔ **Blueprint** (or **Web Service**).
3. Connect your GitHub repository.
4. Render automatically detects [`render.yaml`](file:///c:/Users/Bhagyesh/OneDrive/Desktop/SIH%20Project%20ME/foodbridge/render.yaml) and provisions:
   - A managed **MySQL / PostgreSQL** database (`foodbridge-db`).
   - A **Spring Boot Docker Web Service** (`foodbridge-backend`).
5. Click **Apply**.
6. Once deployed, copy your backend URL (e.g., `https://foodbridge-backend.onrender.com`).

#### Step 3: Deploy Frontend on Vercel
1. Sign up for a free account at [Vercel.com](https://vercel.com).
2. Click **Add New...** ➔ **Project** and import your GitHub repository.
3. Configure the project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://foodbridge-backend.onrender.com` (your Render backend URL from Step 2)
5. Click **Deploy**.
6. Vercel will build and assign you a global HTTPS domain (e.g., `https://foodbridge.vercel.app`) with full client-side SPA routing support handled by [`vercel.json`](file:///c:/Users/Bhagyesh/OneDrive/Desktop/SIH%20Project%20ME/foodbridge/frontend/vercel.json).

---

### Option 2: 1-Command Unified Deployment on VPS (AWS EC2 / DigitalOcean)

If you have a Linux virtual machine (Ubuntu, Debian, CentOS), you can deploy the complete stack (MySQL + Backend + Nginx Frontend) in one command:

1. SSH into your server:
   ```bash
   ssh ubuntu@<your-server-ip>
   ```
2. Clone your repository:
   ```bash
   git clone https://github.com/<your-username>/foodbridge.git
   cd foodbridge
   ```
3. Launch the full production stack:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

**What this does:**
- Builds and starts `foodbridge-prod-mysql` with persistent volume storage.
- Compiles and starts `foodbridge-prod-backend` in a hardened JRE container on port 8080.
- Compiles and starts `foodbridge-prod-frontend` serving the React bundle via Nginx on port 80, automatically reverse-proxying `/api/` traffic to the backend.

To check container status:
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

---

### Option 3: Deploy on Railway

1. Sign up at [Railway.app](https://railway.app).
2. Click **New Project** ➔ **Deploy from GitHub repo**.
3. Railway detects [`railway.json`](file:///c:/Users/Bhagyesh/OneDrive/Desktop/SIH%20Project%20ME/foodbridge/railway.json) and builds the backend via Dockerfile.
4. Add a MySQL database service from Railway's template library.
5. In your backend service variables, connect `SPRING_DATASOURCE_URL`, and Railway will automatically manage the connection string.

---

### ⚙️ Production Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | HTTP port for Spring Boot (auto-assigned by Render/Railway) | `8080` (local), `10000` (Render) |
| `SPRING_PROFILES_ACTIVE` | Active profile (`dev` for H2, `prod` for MySQL) | `prod` |
| `SPRING_DATASOURCE_URL` | JDBC database connection string | `jdbc:mysql://<host>:3306/<db>?useSSL=false` |
| `DB_USERNAME` | Database username | `foodbridge` |
| `DB_PASSWORD` | Database password | `<strong-db-password>` |
| `JWT_SECRET` | 256-bit secret key for HMAC-SHA signing | `<64-hex-character-secret>` |
| `FRONTEND_URL` | Allowed CORS origins for production frontend | `https://*.vercel.app` or custom domain |
| `VITE_API_URL` | Frontend API base URL (Vercel build variable) | `https://<your-backend-domain>` |

---

## ❓ Troubleshooting & FAQ

### 1. `mvn` is not recognized on Windows PowerShell
If Maven is not on your global system path, use the bundled Maven runner located in your IDE installation or run:
```powershell
& "C:\Users\Bhagyesh\.antigravity-ide\extensions\oracle.oracle-java-26.0.2-universal\nbcode\java\maven\bin\mvn.cmd" spring-boot:run
```

### 2. PowerShell execution policy blocks `npm`
If you encounter `npm.ps1 cannot be loaded because running scripts is disabled on this system`, invoke npm via `cmd.exe`:
```powershell
cmd.exe /c npm run dev
```

### 3. Port 8080 or 5173 is already in use
- To change the backend port, add `--server.port=8081` to the Maven command or update `application.yml`.
- To change the frontend port, update `server.port` in `vite.config.ts`.

### 4. How to view emails sent by the system in development?
When running Docker Compose (`docker-compose up -d`), open MailHog's web dashboard at `http://localhost:8025` to inspect all outbound HTML emails in real time without needing real SMTP credentials.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
