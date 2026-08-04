import { Platform } from 'react-native';

const STEP_THRESHOLD_PER_MISSION = 2000;

export interface ActivityReport {
  steps: number;
  isActive: boolean;
}

class HealthService {
  private isAvailable = false;
  private mockSteps = 0;

  constructor() {
  }

  /**
   * Fetches total step count for the current day.
   */
  async getTodayTotalSteps(): Promise<number> {
      return this.mockSteps > 0 ? this.mockSteps : 0;
  }

  /**
   * Fetches step count for a specific time window.
   * On a real device, this would query Health Connect (Android) or HealthKit (iOS).
   */
  async getStepsInRange(start: Date, end: Date): Promise<number> {
    console.log(`[HealthService] Querying steps from ${start.toLocaleTimeString()} to ${end.toLocaleTimeString()}`);

    if (this.mockSteps > 0) {
        return this.mockSteps;
    }

    return 0;
  }

  /**
   * Utility to check if a user was "Active" during a specific window.
   */
  async wasActiveInRange(start: Date, end: Date): Promise<boolean> {
    const steps = await this.getStepsInRange(start, end);
    return steps >= STEP_THRESHOLD;
  }

  setMockSteps(count: number) {
    this.mockSteps = count;
  }
}

export const healthService = new HealthService();
