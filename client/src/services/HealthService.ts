import { Platform } from 'react-native';

// Threshold for auto-validating a mission based on physical activity
const STEP_THRESHOLD = 500;

export interface ActivityReport {
  steps: number;
  isActive: boolean;
}

class HealthService {
  private isAvailable = false;
  private mockSteps = 0;

  constructor() {
    // In a real environment, we would initialize Pedometer or Health Connect here
  }

  /**
   * Fetches step count for a specific time window.
   * On a real device, this would query Health Connect (Android) or HealthKit (iOS).
   */
  async getStepsInRange(start: Date, end: Date): Promise<number> {
    console.log(`[HealthService] Querying steps from ${start.toLocaleTimeString()} to ${end.toLocaleTimeString()}`);

    // FOR DEVELOPMENT: Return mock data if set
    if (this.mockSteps > 0) {
        return this.mockSteps;
    }

    // Default to 0 for now as native modules require custom builds
    return 0;
  }

  /**
   * Utility to check if a user was "Active" during a specific window.
   */
  async wasActiveInRange(start: Date, end: Date): Promise<boolean> {
    const steps = await this.getStepsInRange(start, end);
    return steps >= STEP_THRESHOLD;
  }

  // Debug Helpers
  setMockSteps(count: number) {
    this.mockSteps = count;
  }
}

export const healthService = new HealthService();
