# Challenge Fit - Implementation Roadmap

## ✅ Completed Milestones
**Current State**: Core loop established, group competition live, and production-ready backend.

- [x] **Core Mission Engine**: Daily random missions and time brackets.
- [x] **Flex Mode & Refresh**: Flexibility for user schedules.
- [x] **Gamification**: XP, Levels, Streaks, and Milestones.
- [x] **Group Leaderboards**: Create private groups and compete on date-filtered leaderboards.
- [x] **Social Sharing**: Share group ranks and app invitations via native system share sheet.
- [x] **Mission Failure & Snooze**: 15-minute snooze limit and automatic "MISSED" status for late missions.
- [x] **Inactivity Logic**: 40-minute stationary threshold for notifications.
- [x] **PostgreSQL Migration**: Full migration from JSON files to production database using Prisma.
- [x] **User Authentication**: Secure Login/Register flow with Social OAuth support (Google/Facebook).
- [x] **Theming**: Dark/Light mode with persistence.
- [x] **Stability**: Fixed major native rendering crashes (Gesture Handler/Notifications).

---

## 🚀 Future Targets & Production Expansion

### 1. Rewards & Real-World Movement (Phase 8 - Current Focus)
- [ ] **Tiered XP System**: Implement 5XP per 2,000 steps (if used to complete a goal), 7 XP per completed goal (suggested exercise), and 10XP suggested goal completed "On-Time" (soon after notification). Extra mission is 3xp.
- [ ] **Add xp to server user db**: add the user's xp to the database. There is a maximum of 33xp per day, make sure there is some kind of security to protect against more than that being added.
- [ ] **Real Pedometer Integration**: Prioritize hardware sensors with app-based fallback; Once the app is opened, check phone for current steps walked and update in-app. If in-app pedometer is also used, display whichever number is higher. remove simulation toggles. maybe have a low power drain pedometer screen? try to use low power gps, screen simply has steps (maybe calories burned (guesstimated from total steps walked on that day))
- [ ] **UI Professionalization**: Remove all emojis and streamline messaging for a cleaner aesthetic. Try to make it less ai generated. No static warnings or "well dones", green or red messages should be toasts. Keep the ui clean.
- [ ] **Missed Goal Redemption**: Clearly display that missed goals can be retroactively completed via daily steps. 
- [ ] **Stationary Timer**: Reset the 40-minute timer automatically using real sensor data.

### 2. Rich Content & Guidance
- [ ] **Exercise Instructions**: Add detailed step-by-step guides for all library exercises.
- [ ] **Media Support**: Integrate GIFs and video loops for each exercise to ensure correct form.
- [ ] **Difficulty Scaling**: Dynamically adjust repetition counts based on user's current Level.

### 3. Native Experience & Social
- [ ] **Native Local Notifications**: Re-introduce lock-screen alerts (requires Development Build).
- [ ] **Widget Support**: Simple home screen widget showing current mission status.
- [ ] **Health Connect Integration**: Sync steps and workouts with fitness trackers (Fitbit/Garmin).
- [ ] **Friend Search**: Find and add friends by username in the database.
