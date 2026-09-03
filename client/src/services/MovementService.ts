import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/Config';

export type MovementState = 'STILL' | 'MOVING';

class MovementService {
  private thresholdMinutes = Config.STATIONARY_THRESHOLD_MINUTES;
  private state: MovementState = 'STILL';
  private stationarySince: Date = new Date();
  private mockMode = true;

  constructor() {
    this.loadState();
  }

  private async loadState() {
    try {
      const saved = await SecureStore.getItemAsync('movement_stationary_since');
      if (saved) {
        this.stationarySince = new Date(saved);
      }
    } catch (e) {
      console.error('Failed to load movement state', e);
    }
  }

  async setMovementState(newState: MovementState) {
    const oldState = this.state;
    this.state = newState;

    if (newState === 'STILL' && oldState === 'MOVING') {
      this.stationarySince = new Date();
      await SecureStore.setItemAsync('movement_stationary_since', this.stationarySince.toISOString());
    } else if (newState === 'MOVING') {
    }
  }

  getMovementState(): MovementState {
    return this.state;
  }

  getStationaryMinutes(): number {
    if (this.state === 'MOVING') return 0;
    const now = new Date();
    const diffMs = now.getTime() - this.stationarySince.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  isAvailableForMission(): boolean {
    return this.state === 'STILL' && this.getStationaryMinutes() >= this.thresholdMinutes;
  }

  setMockStationarySince(minutesAgo: number) {
    this.stationarySince = new Date(Date.now() - minutesAgo * 60 * 1000);
    this.state = 'STILL';
  }
}

export const movementService = new MovementService();
