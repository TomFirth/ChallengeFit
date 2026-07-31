# Fitness Quest - Implementation Roadmap

## ✅ Completed Milestones
**Current State**: Core loop established, group competition live, and mission rules strictly enforced.

- [x] **Core Mission Engine**: Daily random missions and time brackets.
- [x] **Flex Mode & Refresh**: Flexibility for user schedules.
- [x] **Gamification**: XP, Levels, Streaks, and Milestones.
- [x] **Group Leaderboards**: Create private groups and compete on date-filtered leaderboards.
- [x] **Social Sharing**: Share group ranks and app invitations via native system share sheet.
- [x] **Mission Failure & Snooze**: 15-minute snooze limit and automatic "MISSED" status for late missions.
- [x] **Real-time Notifications**: Initial simulated alerts via Toast.
- [x] **Theming**: Dark/Light mode with persistence.
- [x] **Simplified Architecture**: Optimized backend by removing legacy Socket.io messaging overhead.

---

## 🚀 Future Targets & Production Expansion

### 1. Native Experience & Persistence (Current Focus)
- [ ] **Native Local Notifications**: Use `expo-notifications` for lock-screen alerts.
- [ ] **PostgreSQL Migration**: Move all JSON mock data to a production-grade database using Prisma.
- [ ] **Background Movement Tracking**: Implement `ACCESS_BACKGROUND_LOCATION` and `ACTIVITY_RECOGNITION`.
- [ ] **Stationary Monitor**: Only trigger mission alerts if the user has been stationary for 40+ minutes.

### 2. Security & Identity
- [ ] **User Authentication**: Implement JWT-based Auth (Login/Register).
- [ ] **Profile Customization**: Allow users to upload avatars and change display names.

### 3. Advanced Experience
- [ ] **Health Connect Integration**: Connect to fitness trackers (Fitbit/Garmin).
- [ ] **Widget Support**: Simple home screen widget showing current mission and streak.
- [ ] **Exercise Media**: Add videos or GIFs for each exercise instruction.
- [ ] **Season Passes**: Time-bound challenges with unique badges/medals.
