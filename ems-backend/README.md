# EMS Backend — Setup Guide

## Prerequisites
- Java 21 (JDK)
- Maven 3.8+
- MySQL 8 running locally (you confirmed you already have this)

## ⚠️ Important: this code has not been compiled in the environment that generated it
The sandbox used to write this code could not reach Maven Central, so **no `mvn compile` has
been run against it**. The code has been hand-reviewed for type correctness, import accuracy,
and Spring wiring, and several library API calls (OpenPDF, Apache POI) were cross-checked
against current documentation — but a first local build may still surface small issues
(a typo, a missing import, a method signature mismatch). This is normal for a project this size
and should take minutes, not hours, to resolve. **Run the steps below and fix anything Maven
reports before assuming a deeper design problem.**

## 1. Configure the database connection
Defaults in `application-dev.yml` assume:
```
url: jdbc:mysql://localhost:3306/ems_db
username: root
password: root
```
Override via environment variables if your local setup differs:
```bash
export DB_USERNAME=your_mysql_user
export DB_PASSWORD=your_mysql_password
```
The database `ems_db` will be created automatically on first run
(`createDatabaseIfNotExist=true` in the JDBC URL) — you don't need to create it manually.

## 2. Build
```bash
cd ems-backend
mvn clean compile
```
Fix any compiler errors Maven reports — check imports and method signatures first, since
those are the most likely source of small issues in hand-written code of this size.

## 3. Run
```bash
mvn spring-boot:run
```
On first run, Flyway will execute `V1__init_schema.sql` (creates all tables) and
`V2__seed_data.sql` (seeds roles, a default Super Admin, leave types, departments,
designations, and sample holidays).

The API will be available at `http://localhost:8080`.
Swagger UI: `http://localhost:8080/swagger-ui.html`

## 4. Default login
```
username: admin
password: Admin@123
```
**Change this password immediately after first login** (`PUT /api/v1/auth/change-password`).

## 5. Environment variables (production)
| Variable | Purpose |
|---|---|
| `JWT_SECRET` | HMAC signing secret for access tokens — **must** be overridden in production (256-bit minimum) |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Production database connection (used when `spring.profiles.active=prod`) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins |
| `COOKIE_SECURE` | Set to `true` in production (requires HTTPS) — defaults to `false` for local HTTP dev |
| `UPLOAD_DIR` | Directory for uploaded files (profile photos, documents) |

## Project layout
See `EMS-ARCHITECTURE.md` (shared separately) for the full module breakdown, database schema,
and API surface — this backend implements that document module-by-module:
Auth → Employee → Department → Attendance → Leave → Payroll → Holiday → Notice →
Performance → Dashboard → Reports → Notifications.

## Known follow-ups not yet implemented
- **Email sending**: `AuthService.forgotPassword()` logs the reset token instead of emailing it
  (no SMTP server configured). Wire in `spring-boot-starter-mail` (already a dependency) with
  real SMTP credentials to complete this.
- **File upload storage**: profile photo / document upload endpoints currently accept a
  pre-uploaded URL rather than handling `multipart/form-data` directly. A `FileStorageService`
  writing to `app.upload.base-dir` is the natural next step.
- **WebSocket notifications**: notifications are polling-based (`GET /notifications/me`) as
  specified in the architecture doc's v1 plan; STOMP/WebSocket upgrade path was intentionally
  deferred.
