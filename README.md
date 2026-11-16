# MarketFlow — Marketplace Seller & Catalog Onboarding

> **Full-stack workflow automation** using **Camunda 8**, **Spring Boot**, **React**, and **H2/PostgreSQL**.  
> Academic project — Milestone 1 & 2 implementation.

---

## Project Overview

MarketFlow automates the complete lifecycle of onboarding marketplace sellers and reviewing their product catalogs using BPMN-driven workflows orchestrated by Camunda 8. The system integrates a React frontend, a Spring Boot REST backend, Camunda Zeebe job workers, and an H2 in-memory database (swappable with PostgreSQL).

**Business Use Case:** Marketplace operations teams manually review seller applications, verify documents, and approve product listings. This project automates that process with structured BPMN workflows, exception handling, multi-instance document review, and real-time status tracking.

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + Vite + Tailwind CSS | React 18, Vite 5 |
| Backend | Spring Boot | 3.3.5 |
| Workflow Engine | Camunda 8 (Zeebe) | 8.5.0 |
| Database | H2 (dev) / PostgreSQL (prod) | H2 2.x / PG 15 |
| Containerization | Docker + Docker Compose | — |
| Build Tool | Maven | 3.9.x |
| Java Version | Java 17 | LTS |

---

## Repository Structure

```
project-repository/
│
├── bpmn-models/
│   ├── seller_onboarding_main.bpmn       ← Main process (Call Activity, Multi-Instance, Boundary Events)
│   ├── catalog_review_child.bpmn         ← Child process (called via Call Activity)
│   └── catalog_upload_form.form          ← Camunda Form for user task
│
├── backend-springboot/
│   ├── src/main/java/com/marketplace/onboarding/
│   │   ├── MarketplaceApplication.java
│   │   ├── controller/                   ← REST controllers
│   │   ├── service/                      ← Business logic layer
│   │   ├── repository/                   ← JPA repositories
│   │   ├── model/                        ← JPA entities
│   │   └── worker/                       ← Camunda Zeebe @JobWorker classes
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend-react/
│   ├── src/
│   │   ├── api/client.js                 ← API client for Spring Boot REST endpoints
│   │   ├── components/
│   │   │   ├── ArrayItemBuilder.jsx      ← Dynamic array builder (Multi-Instance inputs)
│   │   │   ├── TasklistInbox.jsx         ← Custom Tasklist inbox
│   │   │   ├── ProcessStatusTracker.jsx  ← Live process status tracker
│   │   │   ├── Badge.jsx
│   │   │   └── Notification.jsx
│   │   ├── pages/
│   │   │   ├── SellerRegistration.jsx
│   │   │   ├── SellerWorkspace.jsx
│   │   │   ├── AdminReview.jsx
│   │   │   └── MarketplaceCatalog.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                     ← Tailwind CSS
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml                    ← Full stack + Zeebe + Operate + Elasticsearch
└── README.md
```

---

## Application Setup and Execution

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+
- Docker Desktop (for containerized deployment)

### Option A — Local Development (without Docker)

**1. Start the backend**
```bash
cd backend-springboot
mvn spring-boot:run
```
Backend runs at `http://localhost:8080`.  
H2 Console at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:marketplace_onboarding`).

**2. Start the frontend**
```bash
cd frontend-react
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

> **Note:** Without a running Camunda 8 Zeebe engine, workflows are tracked in the database only. The UI still works fully for CRUD operations.

### Option B — Docker Compose (Full Stack + Camunda 8)

```bash
# From the project root
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| H2 Console | http://localhost:8080/h2-console |
| Camunda Operate | http://localhost:8081 |
| Zeebe gRPC | localhost:26500 |
| Elasticsearch | http://localhost:9200 |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend (Vite)                     │
│  SellerRegistration │ SellerWorkspace │ AdminReview             │
│  TasklistInbox      │ ProcessStatusTracker │ MarketplaceCatalog │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP REST (fetch API)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Spring Boot REST Backend                        │
│  SellerController │ ProductController │ TaskController           │
│  ProcessController                                               │
│         │                   │                                    │
│  SellerService          ProductService                           │
│         │                   │                                    │
│  SellerRepository       ProductRepository      TaskRepository    │
│         └──────────────────┬──────────────────────┘             │
│                        H2 / PostgreSQL                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Zeebe Job Workers (@JobWorker)                      │        │
│  │  SellerValidationWorker  │  ProductCatalogWorker     │        │
│  └────────────────┬─────────────────────────────────────┘        │
└───────────────────┼─────────────────────────────────────────────┘
                    │ Zeebe gRPC (port 26500)
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Camunda 8 (Zeebe Engine)                     │
│  Process_SellerOnboarding  │  Process_CatalogReview             │
│  Elasticsearch Exporter    │  Camunda Operate UI                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## BPMN Process Architecture

### Main Process: `Process_SellerOnboarding`
File: `bpmn-models/seller_onboarding_main.bpmn`

| Element | Type | Description |
|---------|------|-------------|
| `SubProcess_Validation` | Sub-Process | Validates seller details; throws BPMN error on failure |
| `BoundaryEvent_ValidationError` | Error Boundary Event | Catches `VALIDATION_FAILED` error; routes to info request task |
| `BoundaryEvent_ValidationTimer` | Timer Boundary Event (non-interrupting) | 48h escalation timer |
| `SubProcess_DocumentReview` | **Parallel Multi-Instance** Sub-Process | Reviews each seller document in parallel |
| `GW_SellerApproved` | Exclusive Gateway | Routes on FEEL: `=sellerApproved = true` |
| `CallActivity_CatalogReview` | **Call Activity** | Calls child process `Process_CatalogReview` |
| `Task_CreateAccount` | Service Task | `@JobWorker(type="create-seller-account")` |
| `Task_SendNotification` | Service Task | `@JobWorker(type="send-approval-notification")` |
| `Task_RejectSeller` | Service Task | `@JobWorker(type="reject-seller")` |

### Child Process: `Process_CatalogReview`
File: `bpmn-models/catalog_review_child.bpmn`

| Element | Type | Description |
|---------|------|-------------|
| `Task_UploadCatalog` | User Task | Assigned to seller; uses Camunda Form |
| `SubProcess_ValidateProducts` | **Sequential Multi-Instance** Sub-Process | Validates each product one by one |
| `GW_ProductValid` | Exclusive Gateway | FEEL: `=catalogValid = true` |
| `GW_ParallelReview` | **Parallel Gateway** (split) | Launches ops review + price check simultaneously |
| `GW_ParallelJoin` | **Parallel Gateway** (join) | Waits for both parallel paths |
| `Task_PublishProducts` | Service Task | `@JobWorker(type="publish-products")` |
| `Task_ActivateStore` | Service Task | `@JobWorker(type="activate-seller-store")` |

---

## FEEL Expression Dictionary

| Expression | Location | Meaning |
|------------|----------|---------|
| `=sellerValid = true` | SubProcess_Validation gateway | Routes to success path when seller data passes validation |
| `=sellerValid = false` | SubProcess_Validation gateway | Routes to error end event (throws BPMN error) |
| `=sellerApproved = true` | GW_SellerApproved | Routes to account creation when seller is approved |
| `=sellerApproved = false` | GW_SellerApproved | Routes to rejection task |
| `=count(validationResults[catalogValid = false]) = 0` | GW_CatalogApproved | Passes when ALL products are valid |
| `=count(validationResults[catalogValid = false]) > 0` | GW_CatalogApproved | Fails when any product is invalid |
| `=every item in validationResults satisfies item.catalogValid = true` | Multi-Instance completion condition | Ends sequential loop only when all products are valid |
| `=documents` | Multi-Instance input collection (document review) | List of seller documents as the input collection |
| `=document` | Multi-Instance input element | Current document item being reviewed |
| `=productItems` | Multi-Instance input collection (product validation) | List of products to validate sequentially |
| `=productItem.productId` | ioMapping input | Extracts productId from the current iteration item |
| `PT48H` | Timer Boundary Event | 48-hour duration for escalation timer |

---

## REST API Reference

### Sellers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sellers` | Register seller + start onboarding workflow |
| `GET` | `/api/sellers` | Get all sellers |
| `GET` | `/api/sellers/{id}` | Get seller by ID |
| `PATCH` | `/api/sellers/{id}/decision` | Approve or reject seller (`{"decision":"APPROVE"}`) |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/products/seller/{sellerId}` | Submit product + start catalog review workflow |
| `GET` | `/api/products` | Get all products (optional `?sellerId=`) |
| `GET` | `/api/products/approved` | Get all approved products |
| `PATCH` | `/api/products/{id}/decision` | Approve or reject product |

### Tasks (Tasklist)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | Get all tasks |
| `GET` | `/api/tasks/pending` | Get pending tasks |
| `POST` | `/api/tasks/{id}/complete` | Complete a task |

### Process

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/process/start` | Start a Camunda process instance |
| `GET` | `/api/process/status/{key}` | Get process instance status |

---

## Zeebe Job Workers

| Worker Type | Class | Description |
|-------------|-------|-------------|
| `validate-seller-details` | `SellerValidationWorker` | Validates seller fields; throws `ZeebeBpmnError("VALIDATION_FAILED")` on failure |
| `create-seller-account` | `SellerValidationWorker` | Sets seller status to APPROVED in DB |
| `reject-seller` | `SellerValidationWorker` | Sets seller status to REJECTED in DB |
| `validate-product-catalog` | `ProductCatalogWorker` | Validates product fields; returns `catalogValid` boolean |
| `publish-products` | `ProductCatalogWorker` | Sets all pending products for a seller to APPROVED |
| `send-approval-notification` | `ProductCatalogWorker` | Logs notification (connects to email connector in production) |
| `activate-seller-store` | `ProductCatalogWorker` | Marks seller store as ACTIVE |

---

## Database Schema

### `sellers` table

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, AUTO |
| business_name | VARCHAR | NOT NULL |
| email | VARCHAR | NOT NULL, UNIQUE |
| contact_name | VARCHAR | NOT NULL |
| phone | VARCHAR | — |
| business_address | VARCHAR(500) | — |
| status | VARCHAR | NOT NULL, default=PENDING |
| process_instance_key | VARCHAR | — |
| created_at | TIMESTAMP | — |

### `products` table

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, AUTO |
| name | VARCHAR | NOT NULL |
| description | VARCHAR(2000) | — |
| price | DECIMAL(12,2) | NOT NULL |
| category | VARCHAR | — |
| sku | VARCHAR | — |
| stock_quantity | INT | — |
| seller_id | BIGINT | FK → sellers.id |
| status | VARCHAR | NOT NULL, default=PENDING_REVIEW |
| rejection_reason | VARCHAR | — |
| process_instance_key | VARCHAR | — |
| created_at | TIMESTAMP | — |

### `tasks` table

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, AUTO |
| task_type | VARCHAR | — |
| assignee | VARCHAR | — |
| status | VARCHAR | default=PENDING |
| entity_id | BIGINT | — |
| entity_type | VARCHAR | — |
| job_key | BIGINT | — |
| created_at | TIMESTAMP | — |
| completed_at | TIMESTAMP | — |

---

## Environment Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:h2:mem:marketplace_onboarding` | Database JDBC URL |
| `DB_USERNAME` | `sa` | Database username |
| `DB_PASSWORD` | _(empty)_ | Database password |
| `ZEEBE_GRPC_ADDRESS` | `http://localhost:26500` | Zeebe gRPC broker address |
| `ZEEBE_CLIENT_ID` | _(empty)_ | Camunda Cloud client ID |
| `ZEEBE_CLIENT_SECRET` | _(empty)_ | Camunda Cloud client secret |

---

## Deploying BPMN to Camunda 8

1. Open **Camunda Modeler** (download from camunda.com)
2. Open `bpmn-models/seller_onboarding_main.bpmn`
3. Click **Deploy** → target your local Zeebe (`localhost:26500`) or Camunda Cloud cluster
4. Repeat for `bpmn-models/catalog_review_child.bpmn`
5. Optionally deploy `bpmn-models/catalog_upload_form.form` for user task forms

---

## Demo Workflow

1. Open `http://localhost:5173`
2. **Register** → Submit seller application → Triggers `Process_SellerOnboarding` in Zeebe
3. **Admin Review** → Approve seller → Zeebe worker sets status to APPROVED
4. **Seller Workspace** → Submit products (use Array Builder for variants/documents) → Triggers `Process_CatalogReview`
5. **Admin Review** → Approve products → Zeebe worker publishes products
6. **Process Tracker** → View live workflow status and progress
7. **Tasklist** → View and complete pending user tasks
8. **Catalog** → Published products appear here

---

## Disclaimer

This is an academic prototype. It does not include authentication, authorization, or production-grade security. Do not deploy publicly or use with real personal data.
