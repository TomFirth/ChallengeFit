# Walkthrough - Feature Update: Notifications & Database Migration

I have implemented native local notifications and migrated the backend from JSON files to a PostgreSQL database using Prisma.

## 🔔 Native Local Notifications
Missions now trigger real system notifications on your device.
- **Background Alerts**: You will receive a buzz and lock-screen alert even when the app is backgrounded.
- **Smart Logic**: Alerts only fire if you have been stationary for 40+ minutes, ensuring the app doesn't interrupt you while you are already active.
- **Auto-Cleanup**: Previous notifications are automatically cleared when you fetch new data.

## 🗄️ PostgreSQL & Prisma Integration
The app has moved from simple JSON storage to a professional relational database setup.
- **Type-Safe Access**: Integrated **Prisma ORM** for all database operations.
- **Relational Schema**: Dedicated tables for `User`, `Group`, `Mission`, and `XPLog` allow for more complex social features in the future.
- **Data Safety**: All mission completions and XP gains are now logged with timestamps in the `XPLog` table.

## 📋 Updated Permissions List
The following permissions are now active in the `app.json` configuration:

| OS | Permission | Purpose |
| :--- | :--- | :--- |
| **Android** | `POST_NOTIFICATIONS` | To alert you when a mission is due. |
| **Android** | `ACCESS_BACKGROUND_LOCATION` | To track movement while the app is closed. |
| **Android** | `ACTIVITY_RECOGNITION` | To detect "Still" vs "Moving" states. |
| **iOS** | `NSMotionUsageDescription` | To detect stationary periods for smarter alerts. |
| **iOS** | `NSLocationAlwaysUsageDescription`| To avoid alerts while you are already moving. |

## 🚀 Finalizing the Migration
To complete the switch to PostgreSQL on your machine:
1.  **Start Database**: `docker-compose up -d db`
2.  **Apply Schema**: `npx prisma migrate dev --name init` (Run this in the `server` folder)
3.  **Import Data**: `tsx src/scripts/migrate_json_to_db.ts` (This moves your current progress from JSON files to Postgres)

## Verification Summary
- **Logic**: Verified notification scheduling math for various mission brackets.
- **DB Integrity**: Confirmed services (`MissionService`, `GroupService`, etc.) correctly translate old JSON data structures into Prisma queries.
- **Docs**: Updated `ROADMAP.md` and `DESIGN.md` to reflect the current production-ready architecture.
