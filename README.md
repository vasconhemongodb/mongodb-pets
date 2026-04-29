# MongoDB Pets Project

This project is a full-stack application for managing pet information, featuring a NestJS backend and a Vue.js frontend. It demonstrates integration with MongoDB and AWS S3 for storage.

## Project Structure

- `backend/`: NestJS application providing the REST API.
- `frontend/`: Vue.js 3 + Vite application for the user interface.
- `scripts/`: Python scripts for database seeding and maintenance.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- MongoDB instance (local or Atlas)
- Python 3 (for scripts)

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env` and update the values (MongoDB URI, S3 credentials, etc.).
4. Start the development server:
   ```bash
   npm run start:dev
   ```

## Running Locally

### Option 1: Without Docker (Development Mode)

This is best for active development with hot-reloading.

1.  **Backend:**
    ```bash
    cd backend
    npm install
    npm run start:dev  # Runs on http://localhost:3000
    ```
2.  **Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev        # Runs on http://localhost:5173
    ```

### Option 2: With Docker (Local Production Simulation)

This uses the optimized Docker images but skips the Traefik/SSL setup for simplicity.

```bash
docker compose -f docker-compose.local.yml up --build
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

### Option 3: Production Deployment (EC2)

This project is designed to run behind a shared Traefik reverse proxy.

1.  **Shared Infrastructure:** Ensure you have the `infra` folder set up outside this repository with Traefik running on an external network named `web-proxy`.
2.  **Configure Project:** Create `.env.production` from `.env.production.example`.
3.  **Launch:**
    ```bash
    docker compose up -d --build
    ```

The apps will automatically register with Traefik using the `DOMAIN_NAME` provided in your `.env.production`.

## Seeding Data

You can use the provided Python scripts to seed the database with pet data:

1. Navigate to the `scripts` directory:
   ```bash
   cd scripts
   ```
2. Run the seed script:
   ```bash
   python seed_pets.py
   ```

## Technologies Used

- **Backend:** NestJS, MongoDB (Native Driver), AWS SDK (S3), TypeScript.
- **Frontend:** Vue.js 3, Vite, TypeScript.
- **Scripts:** Python.
