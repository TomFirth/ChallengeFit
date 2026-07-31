import { prisma } from './PrismaClient.js';
import { Group } from '../models/types.js';

export class GroupService {
  async createGroup(name: string, ownerId: string, memberIds: string[]): Promise<any> {
    return await prisma.group.create({
      data: {
        name,
        ownerId,
        members: {
          connect: [ownerId, ...memberIds].map(id => ({ id }))
        }
      }
    });
  }

  async getGroups(userId: string): Promise<any[]> {
    return await prisma.group.findMany({
      where: {
        members: {
          some: { id: userId }
        }
      }
    });
  }

  async getGroup(groupId: string): Promise<any | null> {
    return await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true
      }
    });
  }
}
