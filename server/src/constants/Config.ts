export const Config = {
  STEP_THRESHOLD_PER_MISSION: 2000,
  SNOOZE_MINUTES: 15,
  REFRESH_COOLDOWN_HOURS: 12,
  MAX_DAILY_MISSIONS: 3,

  // XP Rewards
  XP_PER_MISSION_STEPS: 5,     // 5 XP per 2,000 steps (completing a goal)
  XP_PER_MISSION_MANUAL: 7,    // 7 XP per completed goal (manual)
  XP_PER_MISSION_ON_TIME: 10,   // 10 XP suggested goal completed "On-Time"
  XP_PER_BONUS_MISSION: 3,     // 3 XP for extra mission
  MAX_DAILY_XP: 33,            // Security limit per day

  ON_TIME_THRESHOLD_MINUTES: 15 // Definition of "soon after notification"
};
