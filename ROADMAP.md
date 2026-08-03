# Fitness Quest - Implementation Roadmap

## ✅ Completed Milestones
**Current State**: Core loop established, group competition live, and mission rules strictly enforced.

- [x] **Core Mission Engine**: Daily random missions and time brackets.
- [x] **Flex Mode & Refresh**: Flexibility for user schedules.
- [x] **Gamification**: XP, Levels, Streaks, and Milestones.
- [x] **Group Leaderboards**: Create private groups and compete on date-filtered leaderboards.
- [x] **Social Sharing**: Share group ranks and app invitations via native system share sheet.
- [x] **Mission Failure & Snooze**: 15-minute snooze limit and automatic "MISSED" status for late missions.
- [x] **Inactivity Logic**: 40-minute stationary threshold for notifications (with simulation mode).
- [x] **PostgreSQL Migration**: Production-ready database schema and data migration script.
- [x] **User Authentication**: Secure Login/Register flow with Passport.js (JWT, Google, Facebook).
- [x] **Theming**: Dark/Light mode with persistence.
- [x] **Stability**: Fixed major native rendering crashes (Gesture Handler/Notifications).

---

## 🚀 Future Targets & Production Expansion

### 1. Native Sensors & Movement (Current Focus)
- [ ] **Real Pedometer Integration**: Use `expo-sensors` to detect actual steps and automatically reset the stationary timer.
- [ ] **Background Movement Tracking**: Implement `ACCESS_BACKGROUND_LOCATION` and `ACTIVITY_RECOGNITION` for real-world activity detection.
- [ ] **Intelligent Notification Rescheduling**: Dynamically move brackets if the user is consistently active.

### 2. Rich Content & Guidance
- [ ] **Exercise Instructions**: Add detailed step-by-step guides for all library exercises.
- [ ] **Media Support**: Integrate GIFs and video loops for each exercise to ensure correct form.
- [ ] **Difficulty scaling**: Adjust repetition counts or hold times based on user's current Level.

### 3. Native Experience
- [ ] **Native Local Notifications**: Re-introduce `expo-notifications` for lock-screen alerts (requires Development Build).
- [ ] **Widget Support**: Simple home screen widget showing current mission and daily streak.
- [ ] **Health Connect Integration**: Sync data with fitness trackers (Fitbit/Garmin) via Android Health Connect.

### 4. Advanced Social
- [ ] **Friend Discovery**: Search for users by username or email.
- [ ] **Group Management**: Administrative controls for group owners (kick/invite).
- [ ] **Global Season Leaderboards**: Competitive "Seasons" with unique badges and rewards.
