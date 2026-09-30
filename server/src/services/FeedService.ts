import { FeedEvent } from '../models/types.js';
import { prisma } from './PrismaClient.js';

export class FeedService {
  /**
   * We no longer store events in-memory.
   * We pull directly from the database (Missions and XPLogs).
   */
  constructor() {}

  addEvent(userId: string, username: string, type: FeedEvent['type'], data: any) {
    // This is now effectively a placeholder as events are derived from DB entries
    // but we can keep it if we want to log specific non-persistable events.
    // For now, mission completions and streak milestones are tracked in their own tables.
    console.log(`[FeedService] Event added: ${type} for ${username}`);
  }

  async getFeed(userId: string): Promise<FeedEvent[]> {
    try {
      // 1. Get recent mission completions
      const recentMissions = await prisma.mission.findMany({
        where: {
          status: 'COMPLETED',
          completedAt: { not: null }
        },
        include: {
          user: true
        },
        orderBy: {
          completedAt: 'desc'
        },
        take: 20
      });

      // 2. Map missions to feed events
      const events: FeedEvent[] = recentMissions.map(m => ({
        id: `m-${m.id}`,
        userId: m.userId,
        username: m.user.username,
        type: 'MISSION_COMPLETED',
        data: { exercise: m.exerciseId.replace('-', ' ') },
        timestamp: m.completedAt!
      }));

      // In the future, we can add streak milestones by querying User table or separate log

      return events;
    } catch (error) {
      console.error('[FeedService] Failed to fetch feed:', error);
      return [];
    }
  }
}
