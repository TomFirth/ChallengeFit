# Implementation Plan - Mission Failure & Notification Logic

Implement rules for failing missions if not completed within their time brackets or if snoozed more than once. Users lose their streak if all three daily missions are failed. Local notifications will be sent when exercises are required.

## User Review Required

> [!IMPORTANT]
> - **Snooze Logic**: The requirement is "snooze a mission more than once (15 minute snooze)". I will implement a single 15-minute extension. If not completed after that, it fails.
> - **Failure Check**: The server will periodically check for missions whose brackets have ended without completion.
> - **Streak Loss**: If a user fails ALL 3 missions in a day, their streak is reset to 0. XP remains unchanged.

## Proposed Changes

### [Server]

#### [models/types.ts](file:///home/tom/Code/ChallengeFit/server/src/models/types.ts)
- Add `snoozeCount: number` to `Mission` type.
- Add `originalBracketEnd: string` to `Mission` type to track extensions.

#### [routes/missions.ts](file:///home/tom/Code/ChallengeFit/server/src/routes/missions.ts)
- Add `POST /:id/snooze` endpoint:
    - Checks if `snoozeCount < 1`.
    - Extends `bracket.end` by 15 minutes.
    - Increments `snoozeCount`.
- Update `GET /today` to run a "failure check":
    - For each `PENDING` mission, if current time > `bracket.end`, mark as `MISSED`.
    - If all 3 missions for today are `MISSED`, reset `mockUser.currentStreak = 0`.

### [Client]

#### [services/api.ts](file:///home/tom/Code/ChallengeFit/client/src/services/api.ts)
- Add `snoozeMission: (id: string) => Promise<any>` to `missionApi`.

#### [screens/HomeScreen.tsx](file:///home/tom/Code/ChallengeFit/client/src/screens/HomeScreen.tsx)
- Add "Snooze" button to mission cards (only if `snoozeCount < 1` and inside/after bracket starts).
- Integrate `expo-notifications` (or similar) to schedule local notifications based on mission `scheduledTime`.
- Display a "MISSED" status for failed missions.

## Verification Plan

### Automated Tests
- I'll add a script `verify_streak_reset.ts` in `server/scripts` to mock 3 missed missions and verify `user.json` streak is 0.

### Manual Verification
1. **Notifications**: Verify that a notification is triggered when a mission's `scheduledTime` is reached.
2. **Snooze**: Start a mission, click "Snooze", verify the end time increases by 15 minutes. Verify the button disappears.
3. **Failure**: Wait for a mission bracket to end without completing it. Refresh the home screen. Verify status is "MISSED".
4. **Streak Loss**: Fail all 3 missions. Verify the streak display on top shows 🔥 0.
