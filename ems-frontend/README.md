# EMS Frontend — Setup Guide

## ✅ This code has been build-verified
Unlike the backend (Maven Central wasn't reachable in the sandbox), npm registry access
**was** available here, so this project was actually scaffolded with real `npm install`,
and verified with:
- `npm run build` — production build succeeds, 1885 modules, zero errors
- `npx eslint src` — zero errors, zero warnings
- Dev server boots and serves correctly on `npm run dev`

This is real, tested confidence — not just a careful read-through.

## Prerequisites
- Node.js 18+ (built and tested with Node 22)
- The EMS backend running on `http://localhost:8080` (see `ems-backend/README.md`)

## Setup
```bash
cd ems-frontend
npm install
npm run dev
```
The app runs at `http://localhost:5173`.

`.env` already points `VITE_API_BASE_URL` at `http://localhost:8080/api/v1` — change this if
your backend runs elsewhere.

## Default login
Use the same default Super Admin credentials seeded by the backend:
```
username: admin
password: Admin@123
```

## What's built so far
- **Auth**: Login, Forgot/Reset Password, JWT access-token-in-memory + httpOnly-refresh-cookie
  flow with automatic silent refresh on 401 and on app load
- **Layout shell**: Sidebar (role-aware nav), Topbar (theme toggle, notifications, user menu),
  light/dark theme with persisted preference
- **Dashboard**: Full admin view (stat cards, attendance trend line chart, department
  distribution pie chart) and a simple employee landing view
- **Redux store**: All 8 feature slices (auth, ui, employees, departments, attendance, leave,
  payroll, notifications) wired with the plain-Redux-Toolkit + `createAsyncThunk` pattern from
  the architecture doc
- **Routing**: Full route tree with role-gated `ProtectedRoute`, matching every page in the
  architecture doc

## What's a placeholder (built next)
These pages exist and route correctly but show a "coming soon" placeholder — they're next in
the build queue: Employees (list/form/profile), Attendance (admin + self-service), Leave
(admin + self-service), Payroll (admin + self-service), Departments, Holidays, Notice Board,
Performance. The Redux slices and API wrappers for all of these are **already complete** — only
the page UI itself remains.

## Project structure
Matches `EMS-ARCHITECTURE.md` section 4 exactly: `store/slices`, `api/endpoints`, `features/`,
`layouts/`, `components/`, `theme/`, `hooks/`, `routes/`.
