import fs from 'fs/promises';
import path from 'path';

interface Exercise {
  id: string;
  name: string;
  difficulty: Record<string, any>;
}

export class MissionService {
  private exercisesPath: string;

  constructor() {
    this.exercisesPath = path.join(process.cwd(), 'exercises.json');
  }

  private async loadExercises(): Promise<Exercise[]> {
    const data = await fs.readFile(this.exercisesPath, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.exercises;
  }

  async generateDailyMissions(user: { id: string; startTime: string; endTime: string }): Promise<any[]> {
    const allExercises = await this.loadExercises();

    const shuffled = [...allExercises].sort(() => 0.5 - Math.random());
    const selectedExercises = shuffled.slice(0, 3);

    const startTime = user.startTime || '09:00';
    const endTime = user.endTime || '18:00';

    const startMinutes = this.parseTimeToMinutes(startTime);
    const endMinutes = this.parseTimeToMinutes(endTime);
    
    let totalMinutes = endMinutes - startMinutes;
    if (totalMinutes <= 0) {
        totalMinutes = 60 * 9; // Fallback
    }
    
    const bracketSize = Math.floor(totalMinutes / 3);

    const missions = selectedExercises.map((ex, index) => {
      const bracketStart = startMinutes + (index * bracketSize);
      const bracketEnd = bracketStart + bracketSize;

      const randomOffset = Math.floor(Math.random() * bracketSize);
      const scheduledMinutes = bracketStart + randomOffset;

      const scheduledTime = new Date();
      scheduledTime.setHours(Math.floor(scheduledMinutes / 60), scheduledMinutes % 60, 0, 0);

      return {
        id: `m-${Date.now()}-${index}`,
        userId: user.id,
        exerciseId: ex.id,
        scheduledTime,
        status: 'PENDING',
        bracket: {
          start: this.minutesToTime(bracketStart),
          end: this.minutesToTime(bracketEnd)
        }
      };
    });

    return missions;
  }

  async refreshMission(user: any, missionId: string, currentMissions: any[]): Promise<{ mission: any; cooldownRemaining?: number }> {
    // Cooldown logic could be moved to DB, but keeping it in-memory/simulated for now
    const now = new Date();
    const lastRefresh = user.lastRefreshTimestamp ? new Date(user.lastRefreshTimestamp) : new Date(0);
    const cooldownMs = 12 * 60 * 60 * 1000;
    const elapsed = now.getTime() - lastRefresh.getTime();

    if (elapsed < cooldownMs) {
      return { mission: null as any, cooldownRemaining: Math.ceil((cooldownMs - elapsed) / 1000 / 60) };
    }

    const allExercises = await this.loadExercises();
    const usedExerciseIds = currentMissions.map(m => m.exerciseId);
    const availableExercises = allExercises.filter(ex => !usedExerciseIds.includes(ex.id));

    if (availableExercises.length === 0) {
      throw new Error('No more exercises available to refresh');
    }

    const newEx = availableExercises[Math.floor(Math.random() * availableExercises.length)]!;

    const missionIndex = currentMissions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) throw new Error('Mission not found');

    const updatedMission = {
      ...currentMissions[missionIndex],
      exerciseId: newEx.id,
      snoozeCount: 0,
      status: 'PENDING'
    };

    return { mission: updatedMission };
  }

  private parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  private minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
