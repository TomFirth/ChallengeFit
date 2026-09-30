import { User } from '../models/types.js';

export class GamificationService {
  calculateLevel(totalXP: number): number {
    if (totalXP < 33) return 0;

    // Level formula based on geometric progression: 33 * 3^(level-1)
    // level = floor(log3(totalXP / 11))
    return Math.floor(Math.log(totalXP / 11) / Math.log(3));
  }

  async updateStreak(userId: string): Promise<void> {
      // In a real production app, this would check if today's first completion
      // and increment currentStreak. For now, we'll keep it simple:
      // A day is "active" if at least one mission is done.
      // Streak increases once per day.
  }
}
