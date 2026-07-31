import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../services/PrismaClient.js';

const DATA_DIR = path.join(process.cwd(), 'data');

async function migrate() {
  console.log('🚀 Starting migration...');

  // 1. Migrate Users
  try {
    const userData = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'user.json'), 'utf-8'));
    console.log(`Migrating user: ${userData.username}`);
    await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: {
        id: userData.id,
        username: userData.username,
        startTime: userData.availability[0].startTime,
        endTime: userData.availability[0].endTime,
        currentLevel: userData.currentLevel,
        totalXP: userData.totalXP,
        currentStreak: userData.currentStreak,
        bestStreak: userData.bestStreak,
        daysActive: userData.daysActive,
        lastCompletionDate: userData.lastCompletionDate ? new Date(userData.lastCompletionDate) : null,
      },
    });
  } catch (e) {
    console.warn('⚠️ No user data found to migrate');
  }

  // 2. Migrate Groups
  try {
    const groups = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'groups.json'), 'utf-8'));
    console.log(`Migrating ${groups.length} groups...`);
    for (const group of groups) {
      await prisma.group.upsert({
        where: { id: group.id },
        update: {},
        create: {
          id: group.id,
          name: group.name,
          ownerId: group.ownerId,
          createdAt: group.createdAt ? new Date(group.createdAt) : new Date(),
          members: {
              connect: group.memberIds.map((id: string) => ({ id }))
          }
        },
      });
    }
  } catch (e) {
    console.warn('⚠️ No groups found to migrate');
  }

  // 3. Migrate XP Logs
  try {
    const xpLogs = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'xp_history.json'), 'utf-8'));
    console.log(`Migrating ${xpLogs.length} XP logs...`);
    for (const log of xpLogs) {
      await prisma.xPLog.create({
        data: {
          userId: log.userId,
          amount: log.amount,
          timestamp: new Date(log.timestamp),
        },
      });
    }
  } catch (e) {
    console.warn('⚠️ No XP logs found to migrate');
  }

  // 4. Migrate Missions
  try {
    const missions = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'missions.json'), 'utf-8'));
    console.log(`Migrating ${missions.length} missions...`);
    for (const mission of missions) {
      await prisma.mission.upsert({
        where: { id: mission.id },
        update: {},
        create: {
          id: mission.id,
          userId: mission.userId,
          exerciseId: mission.exerciseId,
          scheduledTime: new Date(mission.scheduledTime),
          status: mission.status,
          completedAt: mission.completedAt ? new Date(mission.completedAt) : null,
          snoozeCount: mission.snoozeCount || 0,
          originalBracketEnd: mission.originalBracketEnd,
          bracketStart: mission.bracket.start,
          bracketEnd: mission.bracket.end,
          createdAt: mission.createdAt ? new Date(mission.createdAt) : new Date(),
        },
      });
    }
  } catch (e) {
    console.warn('⚠️ No missions found to migrate');
  }

  console.log('✅ Migration complete!');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
