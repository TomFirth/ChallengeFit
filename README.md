# Challenge Fit

A gamified exercise app built with React Native (Expo) and Node.js (Express).

## 🚀 Getting Started (Development)

### Prerequisites
- Node.js v24.16.0+
- Android Studio / Emulator
- Docker & Docker Compose

### 1. First-Time Setup (Database)
The app requires a PostgreSQL database. We use Docker to manage this easily.

1.  Ensure Docker network exists and start the DB:
    ```bash
    docker network create proxy 2>/dev/null || true
    docker compose up -d db
    ```
2.  Configure your environment:
    - Copy `server/.env.example` to `server/.env` (default DB URL: `postgresql://user:password@localhost:5432/challengefit`).
3.  Initialize the database schema:
    ```bash
    cd server
    npx prisma db push
    ```

> 💡 **Need to reset/clean local database?** See [`docs/development.md`](docs/development.md) for step-by-step instructions.

### 2. Start the Backend
```bash
cd server
npm install
npm run dev
```

### 3. Start the Mobile App
```bash
cd client
npm install
npx expo start
```
Use the Expo Go app on your phone or an Android Emulator to run the app.

---

## 🛠️ Production Deployment (Raspberry Pi)

This project includes a Dockerized setup optimized for hosting on a Raspberry Pi.

### 1. Build & Deploy
Run the deployment script on your Raspberry Pi:
```bash
./deploy_rpi.sh
```

### 2. Configuration
- **Port**: The server is exposed on port **3001** (proxied via Caddy in production).
- **Database**: A PostgreSQL instance is automatically created and managed by Docker.

---

## 🏗️ Architecture & Features

### Core Loop
- 3 random daily missions.
- Time brackets based on user availability.
- "Flex Mode" for early completion.
- Mission Refresh with 12-hour cooldown.

### Gamification
- XP based on daily missions and streaks.
- Levels calculated from total XP.
- Milestones: *Early Bird* and *Clutch*.

### Social
- Friend Feed of real-time activity events.
- Global and Friend Leaderboards.
- Group-based competitive rankings.

### Settings
- Dark/Light mode support.
- Local storage for user preferences.
