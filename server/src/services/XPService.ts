import { prisma } from './PrismaClient.js';
import { Config } from '../constants/Config.js';

export class XPService {
  async logXP(userId: string, amount: number) {
    // Security check: Daily Max XP limit
    const todayXP = await this.getTodayXP(userId);

    // Calculate how much we can actually add
    const remaining = Math.max(0, Config.MAX_DAILY_XP - todayXP);
    const actualAdd = Math.min(amount, remaining);

    if (actualAdd > 0) {
      await prisma.xPLog.create({
        data: {
          userId,
          amount: actualAdd,
          timestamp: new Date()
        }
      });

      // Update user's totalXP as well
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXP: { increment: actualAdd }
        }
      });
    }

    return actualAdd;
  }

  async getXPForUser(userId: string, since?: Date): Promise<number> {
    const logs = await prisma.xPLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: since || new Date(0)
        }
      }
    });
    return logs.reduce((sum, log) => sum + log.amount, 0);
  }

  async getTodayXP(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await this.getXPForUser(userId, today);
  }
}
