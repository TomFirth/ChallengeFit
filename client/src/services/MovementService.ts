import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/Config';

export type MovementState = 'STILL' | 'MOVING';

class MovementService {
  private thresholdMinutes = Config.STATIONARY_THRESHOLD_MINUTES;
  private state: MovementState = 'STILL';
  private stationarySince: Date = new Date();

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
        // Reset timer when moving
        this.stationarySince = new Date();
    }
  }

  getMovementState(): MovementState {
    return this.state;
  }

  getStationaryMinutes(): number {
    const now = new Date();
    const diffMs = now.getTime() - this.stationarySince.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  isAvailableForMission(): boolean {
    // Alert if stationary for too long
    return this.getStationaryMinutes() >= this.thresholdMinutes;
  }
}

export const movementService = new MovementService();
