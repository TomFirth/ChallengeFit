export type MissionStatus = 'PENDING' | 'COMPLETED' | 'SNOOZED' | 'MISSED';

export interface Mission {
  id: string;
  userId: string;
  exerciseId: string;
  scheduledTime: string;
  status: MissionStatus;
  completedAt?: string;
  snoozeCount: number;
  originalBracketEnd?: string;
  bracket: {
    start: string;
    end: string;
  };
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  instructions: string[];
}
