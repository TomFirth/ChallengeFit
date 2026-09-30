import { Platform } from 'react-native';
import { Config } from '../constants/Config';
import { pedometerService } from './PedometerService';

const STEP_THRESHOLD_PER_MISSION = Config.STEP_THRESHOLD_PER_MISSION;

export interface ActivityReport {
  steps: number;
  isActive: boolean;
}

class HealthService {
  private isAvailable = false;
  private appTrackedSteps = 0;

  constructor() {
    pedometerService.onStepChange(steps => {
        this.appTrackedSteps += steps;
    });
  }

  /**
   * Fetches total step count for the current day.
   * Compares hardware steps vs app-tracked steps and returns the higher value.
   */
  async getTodayTotalSteps(): Promise<number> {
      const hardwareSteps = await pedometerService.getTodayTotalSteps();
      return Math.max(hardwareSteps, this.appTrackedSteps);
  }

  /**
   * Utility to check if a user was "Active" during a specific window.
   */
  async wasActiveInRange(start: Date, end: Date): Promise<boolean> {
    const steps = await pedometerService.getTodayTotalSteps();
    // This is a simplified check for the demo, real app would query range
    return steps >= STEP_THRESHOLD_PER_MISSION;
  }
}

export const healthService = new HealthService();
