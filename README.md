# Blood Share

Online blood bank management system, rewritten from PHP + MySQL pages to:

- **Spring Boot** REST API (`backend/`)
- **React** SPA (`frontend/`)
- **Tailwind CSS** for styling

The original PHP implementation has been removed; the Spring Boot backend and React frontend are maintained.

## Run locally

### Backend

Requires Java 21. On Windows:

```bat
cd backend
mvnw.cmd spring-boot:run
```

The API starts at `http://localhost:8081`. Make sure the datasource configured in `backend/src/main/resources/application.properties` is available before starting the backend.

The local bootstrap super admin login is `admin` / `admin123`. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` to override it. Sign in at `/login`; the bootstrap account has network-wide `SUPERADMIN` access. A super admin can add hospitals, create hospital-scoped `ADMIN` accounts, and add verified donors. Each hospital admin can manage only its assigned hospital's stock, details, and blood requests.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5174`. The Vite dev server forwards `/api` requests to the backend at `http://localhost:8081`.

For the separate Express demo server, run `npm install` and `npm run dev` from the project root, then open `http://localhost:3000`. That server uses in-memory demo data.

### Deploy to Render

Push the repository to GitHub, then create a Render Blueprint from the repository. The root `render.yaml` deploys a single Docker web service that builds the React frontend and Spring Boot backend together, so the service does not run `bun install`.

The Blueprint generates `ADMIN_PASSWORD` and `JWT_SECRET`. Find the generated admin password in the service's environment settings; the username is `admin`. The free Blueprint uses an in-memory H2 database for demo use, so its data is lost when the service restarts or redeploys. Configure a persistent external database with the `SPRING_DATASOURCE_*` environment variables before using it for real donor data.

## Features

Public site:

- Home, about, contact
- Donor registration (starts as inactive until an admin activates)
- Blood request form
- Search active donors

Admin dashboard:

- Counts for donors, inbox, and blood requests
- Inbox, active/inactive donors, blood requests, hospital blood stock
