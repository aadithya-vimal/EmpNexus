# EmpNexus

> A fully functional HR & Employee Management System built as a DBMS project — runs entirely in the browser, no backend required.

**Live demo:** https://aadithya-vimal.github.io/EmpNexus/

---

## Overview

EmpNexus is a browser-based Employee Management System powered by an embedded SQLite database (via [sql.js](https://sql.js.org/)). All data lives in-memory — nothing is sent to a server. The app is deployable as a static site on GitHub Pages.

It covers the full HR lifecycle: employee records, payroll with salary slips, attendance tracking, leave approvals, and project assignments — along with a live SQL editor and interactive schema viewer for the DBMS project component.

---

## Features

| Module | Capabilities |
|---|---|
| **Login** | Role-based authentication (Admin / Employee), session via `localStorage` |
| **Dashboard** | Live stat cards — headcount, departments, active projects, pending leaves |
| **Employees** | Full CRUD, search/filter, cascading delete across all related tables |
| **Departments** | Card grid view, employee count per department, CRUD |
| **Roles** | Table view with user counts, CRUD |
| **Payroll** | Month filter, earnings/deductions breakdown, **printable salary slip** |
| **Attendance** | Daily status tracking (Present / Absent / Leave / Holiday), date filter |
| **Leaves** | Submit requests, inline Approve / Reject actions, status summary cards |
| **Projects** | Status tracking, team management modal with role assignments |
| **Schema Viewer** | Interactive SVG ER diagram, collapsible DDL with syntax highlighting, FK relationships table |
| **SQL Editor** | Live SQLite queries, `Ctrl+Enter` shortcut, quick queries, history, copy as TSV |

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React 18 + Vite | Fast HMR dev experience, minimal bundle |
| Database | [sql.js](https://sql.js.org/) (SQLite → WASM) | In-browser SQLite, zero backend |
| Routing | react-router-dom v6 (HashRouter) | GitHub Pages compatible, no server config |
| Icons | lucide-react | Clean, consistent icon set |
| Hosting | GitHub Pages | Free static hosting |

---

## Database Schema

9 tables with 50+ seed rows each:

```
Department ──┐
             ├── Employee ──┬── Login
Role ─────────┘             ├── Payroll
                            ├── Attendance
                            ├── Leave
                            └── Employee_Project ── Project
```

| Table | Seeded Rows |
|---|---|
| Department | 10 |
| Role | 10 |
| Employee | 61 |
| Login | 61 |
| Payroll | 71 (Jan + Feb 2025) |
| Attendance | 75 |
| Leave | 52 |
| Project | 12 |
| Employee_Project | 60+ |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Run locally

```bash
git clone https://github.com/aadithya-vimal/EmpNexus.git
cd EmpNexus
npm install
npm run dev
```

Open **http://localhost:5173**

### Login credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Employee | `priya.patel` | `pass1234` |

---

## Deployment

The repo includes a GitHub Actions workflow that automatically builds and deploys on every push to `main`.

### Manual deploy steps

1. Go to **Settings → Pages** in this repository
2. Set **Source** to **GitHub Actions**
3. Push to `main` — the workflow handles the rest

**Live URL:** `https://aadithya-vimal.github.io/EmpNexus/`

> The database is seeded fresh on every page load (in-memory SQLite). Changes persist for the browser session only.

---

## Project Structure

```
src/
├── db/
│   ├── db.js          # sql.js singleton, runQuery, queryAll helpers
│   ├── schema.sql     # CREATE TABLE statements
│   └── seed.sql       # 50+ rows per table
├── context/
│   └── DBContext.jsx  # React context + useDB hook
├── components/
│   └── AppShell.jsx   # Sidebar + topbar layout
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Employees.jsx
│   ├── Departments.jsx
│   ├── Roles.jsx
│   ├── Payroll.jsx
│   ├── Attendance.jsx
│   ├── Leaves.jsx
│   ├── Projects.jsx
│   ├── SchemaViewer.jsx  # SVG ER diagram
│   └── SQLEditor.jsx
└── index.css          # Global dark theme design system
```

---

## License

MIT
