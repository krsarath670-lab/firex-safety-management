# 🔥 Fire & Safety Service Management

A professional, mobile-first, enterprise web application engineered for Fire Alarm & Firefighting companies. Built specifically for field operations, on-site Android phone usage, supervisors, technicians, and executive managers.

---

## 📱 Mobile-First Site Engineering Features

- **Field Usability**: Large touch-friendly control targets (min 48px height), single-handed thumb operation, high-contrast fire safety palette (Navy Blue, Signal Red, Pure White, Safety Amber, Emerald Green).
- **Bottom Navigation**: Android standard navigation: `Home | Jobs | Reports | More`.
- **Responsive Device Preview**: Built-in viewport toggle (Android Smartphone 390px, Tablet 768px, Full-screen Desktop) to simulate real-world field conditions.
- **Offline Field Mode**: Works seamlessly in basements and pump rooms without cellular reception. Cache inspection checklists, photos, and signatures offline; automatically synchronizes when internet connection is restored.
- **Voice-to-Text & AI Technical Assistant**: Real-time voice dictation with an engineering translation engine that transforms casual field notes into formal NFPA 72 / NFPA 25 / Civil Defense compliance language.
- **Digital Touch Signatures**: Embedded interactive signature canvas for customer representatives and certified inspectors.
- **Automatic Image Compression**: In-browser canvas compression (~100–150 KB) to ensure rapid PDF compilation without bloat.
- **Official A4 PDF Generator**: Generates formatted, ready-to-print inspection and service reports with company branding, TRN/CR, and legal stamps.

---

## 👥 4 User Roles & Strict RBAC Matrix

The system implements Role-Based Access Control **at the database/API level**, ensuring restricted data cannot be accessed by manual API calls or URL tampering.

| Feature / Permission | GM (General Manager) | Engineer | Supervisor | Technician |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | Full Intelligence | Full Intelligence | Full Intelligence | Limited (Assigned Tasks) |
| **Customers & Sites** | Full CRUD | Full CRUD | Full CRUD | ❌ Restricted |
| **AMC Contracts & Values** | Full Access | Full Access | Full Access | ❌ Forbidden (Values Hidden) |
| **AMC Start / End Dates** | Full Management | Full Management | Full Management | View Only if Assigned |
| **AMC Visit Scheduling** | Full Schedule | Full Schedule | Full Schedule | Assigned Only |
| **Breakdown Jobs** | Full Access | Full Access | Full Access | Assigned Only |
| **Fit-out & Projects** | Full Access | Full Access | Full Access | ❌ Forbidden |
| **Inspection Checklists** | Full Review | Full Review | Full Execution | Assigned Reports |
| **Fault Management** | Full CRUD | Full CRUD | Full CRUD | Add to Assigned Report |
| **Spare Parts & Materials** | Full Inventory | Full Inventory | Full Inventory | Record Consumed Parts |
| **AI Report Assistant** | Full Access | Full Access | Full Access | ✅ Voice & Text Access |
| **Create & Submit Reports** | Yes | Yes | Yes | ✅ Draft → Submit Only |
| **Review & Approve Reports**| ✅ Full Approval | ✅ Full Approval | ✅ Full Approval | ❌ Forbidden |
| **Delete Reports** | Yes | Yes | Yes | ❌ Forbidden |
| **Customer Digital Signature**| Yes | Yes | Yes | If Assigned |
| **User & Staff Administration**| ✅ Full Control | ❌ Restricted | ❌ Restricted | ❌ Forbidden |
| **Company Compliance & Branding**| ✅ Full Control | ❌ Restricted | ✅ Full Control | ❌ Forbidden |

### Report Lifecycle Pipeline
`Draft` ➔ `Submitted` ➔ `Reviewed` ➔ `Approved`
Every transition preserves an immutable audit trail: `created_by`, `assigned_by`, `submitted_by`, `reviewed_by`, and `approved_by` with timestamps.

---

## 🛠️ Complete Operational Workflow

The application supports the complete end-to-end lifecycle:
1. **Customer & Site Setup**: Create customer account with linked multi-site facilities, building types (Hospitality, Industrial Warehouse, Data Center), and installed equipment inventories.
2. **AMC Contract Management**: Issue contracts (e.g., `AMC-2026-001`) with automatic status calculation (`Active`, `Expiring Soon`, `Expired`) and configurable reminder intervals (90, 60, 30, 7 days before expiry).
3. **Visit Scheduling**: Schedule routine visits (Quarterly, Bi-Monthly, Monthly) assigned to technicians and field teams.
4. **On-Site Field Inspection**:
   - **Fire Alarm Checklist**: FACP conditions, AC mains, 12V standby batteries, charger float voltage, smoke/heat detectors, MCPs, sounders, strobes, monitor/control modules, loop isolators, Civil Defense transmitters.
   - **Firefighting Checklist**: Main pump, jockey pump, diesel engine auto-crank, controllers, pressure switches, sprinkler alarm valves, water gongs, hose reels, landing valves, portable extinguishers.
   - One-touch `[ OK ]` `[ Fault ]` `[ N/A ]` buttons with instant photo capture and before/after tags.
5. **Fault Logging & Rectification**: Capture root causes, parts utilized, and before/after comparison photos.
6. **AI Technical Enhancement**: Convert field notes (e.g. *"Replaced 3 smoke detectors in Block A. Tested loop and sounders. System normal."*) into formal engineering report terminology.
7. **Customer Sign-off**: Customer representative signs on the mobile screen with designation and date.
8. **PDF Compilation**: Instant generation of official A4 PDF service reports ready for download, printing, or WhatsApp/email sharing.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Run

1. Clone or navigate to the project directory:
   ```bash
   cd "C:\Users\USER\.gemini\antigravity\scratch\fire-safety-app"
   ```

2. Run the full-stack application (starts Express API & serves built React app):
   ```bash
   node server/index.js
   ```

3. Open your browser:
   ```
   http://localhost:5000
   ```

### Development Mode (with Vite Hot Module Replacement)
To run the Vite dev server with instant hot-reloading:
```bash
# Terminal 1: Backend API
node server/index.js

# Terminal 2: Frontend Dev Server
npm run client
```
Access the dev server at: `http://localhost:5173`

---

## 🔑 Pre-Configured Test Credentials

Use the **Role Switcher** in the top navigation bar to instantaneously test all 4 roles:
- **General Manager (GM)**: `gm@firexbahrain.com` (Ahmed Al-Mansoor)
- **Lead Engineer**: `eng@firexbahrain.com` (David Chen, PE)
- **Field Supervisor**: `supervisor@firexbahrain.com` (Tariq Mahmoud)
- **Field Technician**: `tech@firexbahrain.com` (Rajesh Kumar)

---

## 📂 Project Directory Structure

```
fire-safety-app/
├── server/
│   ├── index.js          # Express REST API, static server & sync endpoint
│   ├── auth.js           # Strict database & API-level RBAC middleware
│   ├── db.js             # High-performance relational JSON database engine
│   ├── ai.js             # AI Technical Report Assistant & NFPA syntax generator
│   └── data/             # Persistent data storage (database.json)
├── src/
│   ├── App.jsx           # Main application routing and core workflows
│   ├── context/
│   │   └── AppContext.jsx# Global state, authentication, offline sync queue
│   ├── components/
│   │   ├── Header.jsx             # Role switcher, offline indicator, alerts
│   │   ├── BottomNav.jsx          # Mobile bottom navigation
│   │   ├── DeviceFrame.jsx        # Android mobile/tablet/desktop view switcher
│   │   ├── Dashboard.jsx          # AMC metrics, expiry alerts, quick actions
│   │   ├── AMCView.jsx            # Contracts, countdowns, reminders & visits
│   │   ├── JobsView.jsx           # Work orders, breakdowns, fit-outs & history
│   │   ├── InspectionChecklist.jsx# Fire alarm & firefighting checklist
│   │   ├── FaultsView.jsx         # Defect tracking & before/after photos
│   │   ├── ReportsView.jsx        # Reports pipeline (Draft->Approved) & audits
│   │   ├── ReportEditor.jsx       # Report creator with auto-filled AMC dates
│   │   ├── PDFReportGenerator.jsx # A4 formatted printable report engine
│   │   ├── AIAssistantModal.jsx   # Voice-to-text & technical wording AI
│   │   ├── SignaturePad.jsx       # Smooth canvas signature capture
│   │   ├── CustomerSiteView.jsx   # Multi-site customer management
│   │   ├── MaterialsView.jsx      # Spare parts & consumables catalog
│   │   ├── CompanySettingsView.jsx# Branding, VAT/CR, and legal report footer
│   │   ├── UserManagementView.jsx # Staff directory & GM role controls
│   │   └── MoreMenu.jsx           # Directory hub & offline sync center
│   ├── index.css                  # Tailored Tailwind styles & A4 print CSS
│   └── main.jsx                   # React root entry point
├── dist/                          # Production optimized build bundle
├── package.json                   # Project manifest & dependencies
├── vite.config.js                 # Vite bundler configuration
└── tailwind.config.js             # Fire safety corporate theme
```
