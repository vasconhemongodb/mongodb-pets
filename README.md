# MongoDB Pets Project

This project is a full-stack application for managing pet information, featuring a NestJS backend and a Vue.js frontend. It demonstrates integration with MongoDB and AWS S3 for storage.

## Project Structure

- `backend/`: NestJS application providing the REST API.
- `frontend/`: Vue.js 3 + Vite application for the user interface.

## Prerequisites

- Node.js (v18 or later)
- MongoDB instance (local or Atlas)
- **Container Engine:** Docker or Podman (optional, for containerized execution)

## Running Locally

### Option 1: Development Mode (Manual)

This is best for active development with hot-reloading.

1.  **Backend:**
    ```bash
    cd backend
    npm install
    # Copy .env.development.example to .env and configure
    npm run start:dev  # Runs on http://localhost:3000
    ```
2.  **Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev        # Runs on http://localhost:5173
    ```

### Option 2: Containerized (Local Production Simulation)

This uses optimized images and orchestrates both services using Docker or Podman.

**Using Docker:**
```bash
docker compose -f docker-compose.local.yml up --build
```

**Using Podman:**
```bash
podman compose -f docker-compose.local.yml up --build
```
> **Note for Podman users:** Ensure you have `podman-compose` installed or use the built-in `podman compose` (available in Podman 4+).

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Production Deployment (EC2)

This project is designed to run behind a shared Traefik reverse proxy.

1.  **Shared Infrastructure:** Ensure you have the `infra` folder set up outside this repository with Traefik running on an external network named `web-proxy`.
2.  **Configure Project:** Create `.env.production` from `.env.production.example`.
3.  **Launch:**
    ```bash
    # Using Docker
    docker compose up -d --build

    # Using Podman
    podman compose up -d --build
    ```

The apps will automatically register with Traefik using the `DOMAIN_NAME` provided in your `.env.production`.

## Technologies Used

- **Backend:** NestJS, MongoDB (Native Driver), AWS SDK (S3), TypeScript.
- **Frontend:** Vue.js 3, Vite, TypeScript.
