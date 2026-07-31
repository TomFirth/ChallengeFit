import { User } from '../models/types.js';

export class GamificationService {
  calculateXP(exercisesToday: number, daysActive: number, currentStreak: number): number {
    const baseXP = 10;
    const streakMultiplier = Math.min(2, 1 + (currentStreak * 0.1));
    return Math.floor((exercisesToday * daysActive) * streakMultiplier * baseXP / 10);
  }

  calculateLevel(totalXP: number): number {
    return Math.floor(Math.sqrt(totalXP / 10));
  }

  updateStreak(user: User): { streakIncreased: boolean; streakReset: boolean } {
    const now = new Date();
    const lastDate = user.lastCompletionDate ? new Date(user.lastCompletionDate) : null;

    if (!lastDate) {
      user.currentStreak = 1;
      user.bestStreak = 1;
      return { streakIncreased: true, streakReset: false };
    }

    const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) {
      return { streakIncreased: false, streakReset: false };
    } else if (diffDays === 1) {
      user.currentStreak += 1;
      if (user.currentStreak > user.bestStreak) {
        user.bestStreak = user.currentStreak;
      }
      return { streakIncreased: true, streakReset: false };
    } else {
      user.currentStreak = 1;
      return { streakIncreased: true, streakReset: true };
    }
  }

  checkMilestones(user: User, mission: any): string[] {
    const milestones: string[] = [];
    const now = new Date();
    const hours = now.getHours();

    if (hours < 9) {
      milestones.push('Early Bird');
    }

    if (mission.bracket && mission.bracket.end) {
      const [endH, endM] = mission.bracket.end.split(':').map(Number);
      const bracketEnd = new Date();
      bracketEnd.setHours(endH || 0, endM || 0, 0, 0);
      const diffMins = (bracketEnd.getTime() - now.getTime()) / (1000 * 60);

      if (diffMins > 0 && diffMins < 15) {
        milestones.push('Clutch');
      }
    }

    return milestones;
  }
}
