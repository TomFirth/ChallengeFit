import { Router } from 'express';
import { MissionService } from '../services/MissionService.js';
import { GamificationService } from '../services/GamificationService.js';
import { XPService } from '../services/XPService.js';
import { feedService } from './social.js';
import { prisma } from '../services/PrismaClient.js';

const router = Router();
const missionService = new MissionService();
const gamificationService = new GamificationService();
const xpService = new XPService();

const runFailureCheck = async (userId: string) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const pendingMissions = await prisma.mission.findMany({
        where: { userId, status: 'PENDING' }
    });

    let changed = false;
    for (const m of pendingMissions) {
        if (currentTime > m.bracketEnd) {
            await prisma.mission.update({
                where: { id: m.id },
                data: { status: 'MISSED' }
            });
            changed = true;
        }
    }

    if (changed) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const missions = await prisma.mission.findMany({
            where: { userId, createdAt: { gte: today } }
        });
        const allMissed = missions.length > 0 && missions.every(m => m.status === 'MISSED');
        if (allMissed) {
            await prisma.user.update({
                where: { id: userId },
                data: { currentStreak: 0 }
            });
        }
    }
};

router.get('/today', async (req, res) => {
  try {
    const userId = (req.user as any).id;
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyMissions = await prisma.mission.findMany({
      where: { userId, createdAt: { gte: today } }
    });

    if (dailyMissions.length === 0) {
      const generated = await missionService.generateDailyMissions(user as any);
      for (const m of generated) {
          await prisma.mission.create({
              data: {
                  id: m.id,
                  userId: m.userId,
                  exerciseId: m.exerciseId,
                  scheduledTime: m.scheduledTime,
                  status: m.status,
                  bracketStart: m.bracket.start,
                  bracketEnd: m.bracket.end,
              }
          });
      }
      dailyMissions = await prisma.mission.findMany({
          where: { userId, createdAt: { gte: today } }
      });
      await runFailureCheck(userId);
    } else {
        await runFailureCheck(userId);
    }

    // Refresh user data after checks
    user = await prisma.user.findUnique({ where: { id: userId } });
    const missions = await prisma.mission.findMany({
        where: { userId, createdAt: { gte: today } }
    });

    const allCompleted = missions.length > 0 && missions.every(m => m.status === 'COMPLETED');

    res.json({
      missions,
      allCompleted,
      user: {
        xp: user?.totalXP,
        level: user?.currentLevel,
        streak: user?.currentStreak,
        availability: { startTime: user?.startTime, endTime: user?.endTime }
      }
    });
  } catch (error) {
    console.error('Failed to generate missions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const isFlexMode = req.query.flex === 'true';
  const mission = await prisma.mission.findUnique({ where: { id } });

  if (!mission) return res.status(404).json({ error: 'Mission not found' });
  if (mission.status === 'COMPLETED') return res.status(400).json({ error: 'Mission already completed' });
  if (mission.status === 'MISSED') return res.status(400).json({ error: 'Mission already missed' });

  if (!isFlexMode) {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (timeStr < mission.bracketStart) {
      return res.status(400).json({ error: 'Bracket not started yet. Use Flex Mode to complete early.' });
    }
    if (timeStr > mission.bracketEnd) {
        return res.status(400).json({ error: 'Mission bracket ended. You missed it!' });
    }
  }

  await prisma.mission.update({
    where: { id },
    data: { status: 'COMPLETED', completedAt: new Date() }
  });

  const user = await prisma.user.findUnique({ where: { id: mission.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dailyMissions = await prisma.mission.findMany({
      where: { userId: user.id, createdAt: { gte: today } }
  });

  const completedTodayCount = dailyMissions.filter(m => m.status === 'COMPLETED').length;
  const xpEarned = gamificationService.calculateXP(completedTodayCount, user.daysActive || 1, user.currentStreak);

  const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
          totalXP: user.totalXP + xpEarned,
          currentLevel: gamificationService.calculateLevel(user.totalXP + xpEarned),
          lastCompletionDate: new Date(),
          daysActive: user.daysActive + 1
          // Note: updateStreak logic needs to be integrated here or simplified for DB
      }
  });

  await xpService.logXP(user.id, xpEarned);

  feedService.addEvent(user.id, user.username, 'MISSION_COMPLETED', {
    exercise: mission.exerciseId.replace('-', ' '),
  });

  const allCompleted = dailyMissions.every(m => m.status === 'COMPLETED');

  res.json({
    message: `Mission completed! You earned ${xpEarned} XP!`,
    xpEarned,
    newTotalXP: updatedUser.totalXP,
    newLevel: updatedUser.currentLevel,
    allCompleted
  });
});

router.post('/:id/snooze', async (req, res) => {
    const { id } = req.params;
    const mission = await prisma.mission.findUnique({ where: { id } });

    if (!mission) return res.status(404).json({ error: 'Mission not found' });
    if (mission.status !== 'PENDING') return res.status(400).json({ error: 'Only pending missions can be snoozed' });
    if (mission.snoozeCount >= 1) return res.status(400).json({ error: 'You can only snooze a mission once' });

    const [h, m] = mission.bracketEnd.split(':').map(Number);
    const date = new Date();
    date.setHours(h || 0, (m || 0) + 15, 0, 0);
    
    const newEnd = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    await prisma.mission.update({
        where: { id },
        data: {
            originalBracketEnd: mission.originalBracketEnd || mission.bracketEnd,
            bracketEnd: newEnd,
            snoozeCount: 1
        }
    });

    res.json({ message: 'Mission snoozed for 15 minutes!' });
});

router.post('/:id/validate', async (req, res) => {
    const { id } = req.params;
    const { steps } = req.body;
    const mission = await prisma.mission.findUnique({ where: { id } });

    if (!mission) return res.status(404).json({ error: 'Mission not found' });
    if (mission.status === 'COMPLETED') return res.status(400).json({ error: 'Already completed' });

    // Validate if activity meets threshold (2000 steps per mission)
    if (steps < 2000) {
        return res.status(400).json({ error: 'Physical activity not high enough for auto-validation (need 2000 steps)' });
    }

    await prisma.mission.update({
        where: { id },
        data: { status: 'COMPLETED', completedAt: new Date() }
    });

    const user = await prisma.user.findUnique({ where: { id: mission.userId } });
    if (user) {
        const xpEarned = 10; // Flat XP for auto-validation
        await prisma.user.update({
            where: { id: user.id },
            data: {
                totalXP: user.totalXP + xpEarned,
                currentLevel: gamificationService.calculateLevel(user.totalXP + xpEarned),
            }
        });
        await xpService.logXP(user.id, xpEarned);
    }

    res.json({ message: 'Mission auto-validated based on physical activity! 💪' });
});

router.post('/bonus', async (req, res) => {
    const userId = (req.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Ensure all 3 daily missions are done
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyMissions = await prisma.mission.findMany({
        where: { userId, createdAt: { gte: today } }
    });

    if (dailyMissions.filter(m => m.status === 'COMPLETED').length < 3) {
        return res.status(400).json({ error: 'Complete your 3 daily missions first!' });
    }

    // Generate a bonus mission (excluding ones already done today)
    const usedExerciseIds = dailyMissions.map(m => m.exerciseId);

    // For MVP, we'll just generate new ones and find the first that isn't used
    const generated = await missionService.generateDailyMissions(user as any);
    const bonusEx = generated.find(m => !usedExerciseIds.includes(m.exerciseId)) || generated[0];

    const bonusMission = await prisma.mission.create({
        data: {
            id: `bonus-${Date.now()}`,
            userId,
            exerciseId: bonusEx.exerciseId,
            scheduledTime: new Date(),
            status: 'PENDING',
            bracketStart: '00:00', // Always available
            bracketEnd: '23:59',   // Till end of day
        }
    });

    res.json({ message: 'Bonus mission granted! Go for it!', mission: bonusMission });
});

router.post('/availability', async (req, res) => {
  const { startTime, endTime } = req.body;
  if (!startTime || !endTime) return res.status(400).json({ error: 'Missing start or end time' });

  const userId = (req.user as any).id;
  const user = await prisma.user.update({
      where: { id: userId },
      data: { startTime, endTime }
  });

  // Re-generate missions logic... for simplicity in MVP, we delete today's pending missions and regenerate
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.mission.deleteMany({
      where: { userId, status: 'PENDING', createdAt: { gte: today } }
  });

  const generated = await missionService.generateDailyMissions(user as any);
  for (const m of generated) {
      await prisma.mission.create({
          data: {
              id: m.id,
              userId: m.userId,
              exerciseId: m.exerciseId,
              scheduledTime: m.scheduledTime,
              status: m.status,
              bracketStart: m.bracket.start,
              bracketEnd: m.bracket.end,
          }
      });
  }

  res.json({ message: 'Availability updated and missions rescheduled!' });
});

export default router;
