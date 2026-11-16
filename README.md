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

The API starts at `http://localhost:8081` (or the value of `PORT`) and uses an H2 file database under `backend/data/`.

To connect to MySQL, set these environment variables:

```text
SPRING_DATASOURCE_URL=jdbc:mysql://<host>:3306/blood_donation
SPRING_DATASOURCE_USERNAME=<database-user>
SPRING_DATASOURCE_PASSWORD=<database-password>
```

The local default admin login is `admin` / `admin123`. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` to override it.

### Frontend

```bash
npm install
npm run dev
```

These commands run from the project root (including in Google AI Studio). Open `http://localhost:5174`. To run the frontend standalone, use the same commands from `frontend/`.

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
