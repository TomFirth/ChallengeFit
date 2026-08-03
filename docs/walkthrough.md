# Walkthrough - Daily Goals & Bonus Missions

I have implemented the daily cumulative step goal and the optional bonus mission feature.

## Changes

### 🚶 Daily Step Goals (Cumulative)
Physical activity now scales to complete your missions throughout the day.
- **Tiers**:
    - **2000 steps**: Automatically completes 1st mission.
    - **4000 steps**: Automatically completes 2nd mission.
    - **6000 steps**: Automatically completes 3rd mission.
- **Banked Activity**: If you hike 6000 steps and open the app at lunch, all three missions are marked **DONE** immediately, even if their scheduled times haven't arrived yet.
- **UI Banner**: A new status banner shows your total steps for today and how many more you need to reach your goal.
- **File**: [HomeScreen.tsx](file:///home/tom/Code/ChallengeFit/client/src/screens/HomeScreen.tsx), [HealthService.ts](file:///home/tom/Code/ChallengeFit/client/src/services/HealthService.ts)

### 🎯 Bonus Fun Missions
Once you've crushed your daily goal, you can now take on extra challenges.
- **Unlock**: After completing all 3 daily missions (via steps or manual work), an **"+ Extra Fun Mission"** button appears.
- **Randomized**: Generates a new, optional exercise not already performed today.
- **XP Reward**: Completing bonus missions awards extra XP toward your level.
- **File**: [missions.ts](file:///home/tom/Code/ChallengeFit/server/src/routes/missions.ts)

## Verification Results
- **Tier Logic**: Verified that mocking 4500 steps automatically validates exactly 2 missions.
- **Success Messaging**: Verified the dynamic message: *"You completed X steps today - all exercises completed! Well done! 🎉"*
- **Bonus Flow**: Confirmed that the bonus button only appears when the 3-mission goal is met and correctly fetches a new exercise.
- **Hike Simulator**: Updated the "Simulate Hike" button to mock **6000 steps**, allowing you to see the full "auto-completion" flow instantly.
