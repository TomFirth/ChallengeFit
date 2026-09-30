import { Pedometer } from 'expo-sensors';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class PedometerService {
  private isAvailable = false;
  private currentSteps = 0;
  private subscription: any = null;
  private onStepChangeCallbacks: ((steps: number) => void)[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    this.isAvailable = await Pedometer.isAvailableAsync();
    if (this.isAvailable) {
      this.startWatching();
    }
  }

  async startWatching() {
    if (this.subscription) return;

    this.subscription = Pedometer.watchStepCount(result => {
      this.currentSteps = result.steps;
      this.onStepChangeCallbacks.forEach(cb => cb(this.currentSteps));
    });
  }

  stopWatching() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  onStepChange(callback: (steps: number) => void) {
    this.onStepChangeCallbacks.push(callback);
    return () => {
      this.onStepChangeCallbacks = this.onStepChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  async getTodayTotalSteps(): Promise<number> {
    if (!this.isAvailable) return 0;

    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      return result.steps;
    } catch (e) {
      console.error('Failed to get step count', e);
      return 0;
    }
  }

  calculateCalories(steps: number): number {
    // Average 0.045 calories per step
    return Math.floor(steps * 0.045);
  }
}

export const pedometerService = new PedometerService();
