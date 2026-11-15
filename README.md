# Marketplace Seller & Catalog Onboarding

Academic starter project: React + Vite frontend, Spring Boot REST API, MySQL database

## Run it
1. Create a MySQL database: `CREATE DATABASE marketplace_onboarding;`
2. In `backend/src/main/resources/application.properties`, update the MySQL username/password (defaults: root/root), or set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
3. Run backend: `cd backend && mvn spring-boot:run` (JDK 17+ and Maven required).
4. Run frontend in another terminal: `cd frontend && npm install && npm run dev` (Node.js 18+ required).
5. Open http://localhost:5173. Backend runs at http://localhost:8080.

## Demo flow
Register seller → Admin Review approves seller → Seller Workspace submits product → Admin Review approves product → Marketplace Catalog displays it.

## API
- POST/GET `/api/sellers`
- PATCH `/api/sellers/{id}/decision` with `{"decision":"APPROVE"}` or `REJECT`
- POST `/api/products/seller/{sellerId}`
- GET `/api/products`, GET `/api/products/approved`
- PATCH `/api/products/{id}/decision`

This is an academic prototype, not production-ready authentication or document-management software. It uses demo admin actions without login/authorization. Do not use real personal data or deploy publicly as-is.
