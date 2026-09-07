# Walkthrough - Native Notifications & PostgreSQL Migration

I have implemented native lock-screen notifications and prepared the backend for a production-grade PostgreSQL database.

## 🔔 Native Local Notifications
Missions now trigger real system notifications on your device.
- **Background Support**: Alerts will appear even if the app is closed or in your pocket.
- **Smart Logic**: Notifications are only sent if the user has been stationary for 40+ minutes (using the logic from Phase 4).
- **Permissions**: Added `POST_NOTIFICATIONS` for Android and relevant usage descriptions for iOS.
- **File**: [HomeScreen.tsx](file:///home/tom/Code/ChallengeFit/client/src/screens/HomeScreen.tsx)

## 🗄️ PostgreSQL & Prisma Migration
The app is now ready to move from JSON files to a relational database.
- **ORM**: Integrated **Prisma** for type-safe database access.
- **Schema**: Defined tables for `User`, `Group`, `Mission`, and `XPLog` in `prisma/schema.prisma`.
- **Backend Refactor**: Updated `MissionService`, `GroupService`, and `XPService` to communicate with the database instead of the file system.
- **Migration Script**: Created `src/scripts/migrate_json_to_db.ts` to safely move your current progress into Postgres.

## 📋 Updated Permissions List
The following permissions are now configured in `app.json`:

### Android
- `android.permission.POST_NOTIFICATIONS`: To show mission alerts.
- `android.permission.ACCESS_BACKGROUND_LOCATION`: To track movement in the background.
- `android.permission.ACTIVITY_RECOGNITION`: To detect stationary vs. active states.

### iOS
- `UNUserNotificationCenter`: Handled by `expo-notifications`.
- `NSLocationAlwaysAndWhenInUseUsageDescription`: For background activity suppression.
- `NSMotionUsageDescription`: For stationary detection.

## 🚀 Deployment Instructions
To finalize the migration:
1. Start your database: `docker compose up -d db`
2. Run Prisma migrations: `npx prisma migrate dev`
3. Run the data migration script: `tsx src/scripts/migrate_json_to_db.ts`
