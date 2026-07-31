export type User = {
  id: string;
  username: string;
  availability: Availability[];
  currentLevel: number;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  daysActive: number;
  lastCompletionDate?: Date;
  lastRefreshTimestamp?: Date;
  friends: string[];
};

export type Availability = {
  day: string;
  startTime: string;
  endTime: string;
};

export type MissionStatus = 'PENDING' | 'COMPLETED' | 'SNOOZED' | 'MISSED';

export type Mission = {
  id: string;
  userId: string;
  exerciseId: string;
  scheduledTime: Date;
  status: MissionStatus;
  completedAt?: Date;
  snoozeCount: number;
  originalBracketEnd?: string;
  bracket: {
    start: string;
    end: string;
  };
};

export type Group = {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
};

export type FeedEvent = {
  id: string;
  userId: string;
  username: string;
  type: 'MISSION_COMPLETED' | 'MISSION_MISSED' | 'STREAK_MILESTONE';
  data: any;
  timestamp: Date;
};
