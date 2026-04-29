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

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Seeding Data

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
