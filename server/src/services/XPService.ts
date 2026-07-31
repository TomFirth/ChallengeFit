import { prisma } from './PrismaClient.js';

export class XPService {
  async logXP(userId: string, amount: number) {
    await prisma.xPLog.create({
      data: {
        userId,
        amount,
        timestamp: new Date()
      }
    });
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
}
