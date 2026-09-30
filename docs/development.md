# Challenge Fit - Development & Database Guide

This document covers running Challenge Fit locally, resetting/cleaning the PostgreSQL database, and deploying to production.

---

## 🗄️ Resetting & Cleaning Local PostgreSQL Database

If you forgot your database password, want to clear test users, or need a fresh database environment:

### 1. Completely Wipe Local DB Containers & Volumes
Run from the project root:
```bash
# Stop containers and remove volumes (-v flag wips database data)
docker compose down -v
```

### 2. Ensure Required Docker Network Exists
```bash
docker network create proxy 2>/dev/null || true
```

### 3. Start Fresh Database Container
```bash
docker compose up -d db
```

#### Default Fresh DB Credentials
* **User**: `user`
* **Password**: `password`
* **Database**: `challengefit`
* **Port**: `5432`
* **Local Connection String**: `postgresql://user:password@localhost:5432/challengefit`

### 4. Push Schema & Seed Initial Data
Ensure your `server/.env` file contains:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/challengefit"
JWT_SECRET="dev_secret_key"
```

Then run:
```bash
cd server
npm install

# Apply Prisma schema to the new database
npx prisma db push

# Optional: Seed initial mock data (exercises & test user)
npx tsx src/scripts/migrate_json_to_db.ts
```

---

## 🔍 Viewing & Managing Database Users

### Method 1: Prisma Studio (Web GUI Interface - Recommended)
Prisma provides a built-in visual database browser in your web browser:

```bash
cd server
npx prisma studio
```
Open **`http://localhost:5555`** in your browser. You can view, edit, search, and delete `User` records directly in the UI.

### Method 2: Via Docker CLI (`psql`)

#### 1. View all users:
```bash
docker exec -it challengefit-db psql -U user -d challengefit -c "SELECT id, email, username FROM \"User\";"
```

#### 2. Delete a user by email:
```bash
docker exec -it challengefit-db psql -U user -d challengefit -c "DELETE FROM \"User\" WHERE email = 'user@example.com';"
```

---

## 🚀 Development Workflow

From the root of the project, you can use the root `package.json` scripts:

```bash
# Start backend server with hot-reloading (nodemon)
npm run dev:server

# Start Expo React Native client
npm run dev:client
```

---

## 📦 Production Builds & Deployment

### 1. Deploying Backend to Raspberry Pi / Production Server
```bash
npm run deploy
```
*(Runs `./deploy_rpi.sh` which transfers files and starts `docker-compose.yml` with `NODE_ENV=production`)*.

### 2. Building Android Release App (APK/AAB)
```bash
npm run build:android
```
*(Runs `./build_android.sh` which executes Expo prebuild and `./gradlew assembleRelease` or `./gradlew bundleRelease`)*.
