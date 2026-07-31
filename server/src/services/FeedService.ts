import { FeedEvent } from '../models/types.js';

export class FeedService {
  private events: FeedEvent[] = [];

  constructor() {
    // Initial mock events
    this.events = [
      {
        id: 'e1',
        userId: 'u2',
        username: 'Sarah',
        type: 'MISSION_COMPLETED',
        data: { exercise: 'Push Ups' },
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 'e2',
        userId: 'u3',
        username: 'Mike',
        type: 'STREAK_MILESTONE',
        data: { streak: 10 },
        timestamp: new Date(Date.now() - 7200000)
      }
    ];
  }

  addEvent(userId: string, username: string, type: FeedEvent['type'], data: any) {
    const event: FeedEvent = {
      id: `e-${Date.now()}`,
      userId,
      username,
      type,
      data,
      timestamp: new Date()
    };
    this.events.unshift(event);
    // Keep feed size manageable
    if (this.events.length > 50) this.events.pop();
    return event;
  }

  getFeed(userIds: string[]): FeedEvent[] {
    // In a real app, filter events by the user's friends
    return this.events;
  }
}
