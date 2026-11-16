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

The API starts at `http://localhost:8081` (port **8081**, because 8080 is often taken) and uses an H2 file database under `backend/data/`.

To use the existing MySQL `blood_donation` database:

```bat
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
```

Set `DB_USER` and `DB_PASSWORD` if they are not `root` / empty.

Default admin login: `admin` / `admin123`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Features

Public site:

- Home, about, contact
- Donor registration (starts as inactive until an admin activates)
- Blood request form
- Search active donors

Admin dashboard:

- Counts for donors, inbox, and blood requests
- Inbox, active/inactive donors, blood requests, hospital blood stock
