import { Router } from 'express';
import { MissionService } from '../services/MissionService.js';
import { GamificationService } from '../services/GamificationService.js';
import { XPService } from '../services/XPService.js';
import { Config } from '../constants/Config.js';
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
      await prisma.mission.deleteMany({
        where: { userId, createdAt: { lt: today } }
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
      dailyMissions = await prisma.mission.findMany({
          where: { userId, createdAt: { gte: today } }
      });
      await runFailureCheck(userId);
    } else {
        await runFailureCheck(userId);
    }

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

  const now = new Date();
  const [h, m] = mission.bracketStart.split(':').map(Number);
  const bracketStart = new Date();
  bracketStart.setHours(h || 0, m || 0, 0, 0);

  const diffMins = (now.getTime() - bracketStart.getTime()) / (1000 * 60);
  const isOnTime = diffMins >= 0 && diffMins <= Config.ON_TIME_THRESHOLD_MINUTES;

  let xpEarned = isOnTime ? Config.XP_PER_MISSION_ON_TIME : Config.XP_PER_MISSION_MANUAL;

  if (mission.id.startsWith('bonus-')) {
      xpEarned = Config.XP_PER_BONUS_MISSION;
  }

  const isFirstCompletionToday = dailyMissions.filter(m => m.status === 'COMPLETED').length === 1;
  if (isFirstCompletionToday && user.currentStreak > 0) {
      xpEarned += user.currentStreak;
  }

  const actualXpAdded = await xpService.logXP(user.id, xpEarned);

  const nowComp = new Date();
  const lastDate = user.lastCompletionDate ? new Date(user.lastCompletionDate) : null;
  let streakUpdate = {};

  if (!lastDate) {
      streakUpdate = { currentStreak: 1, bestStreak: 1 };
  } else {
      const diffDays = Math.floor((nowComp.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
          const newStreak = user.currentStreak + 1;
          streakUpdate = {
              currentStreak: newStreak,
              bestStreak: Math.max(newStreak, user.bestStreak)
          };
      } else if (diffDays > 1) {
          streakUpdate = { currentStreak: 1 };
      }
  }

  await prisma.user.update({
      where: { id: user.id },
      data: {
          currentLevel: gamificationService.calculateLevel(user.totalXP + actualXpAdded),
          lastCompletionDate: nowComp,
          daysActive: user.daysActive + 1,
          ...streakUpdate
      }
  });

  feedService.addEvent(user.id, user.username, 'MISSION_COMPLETED', {
    exercise: mission.exerciseId.replace('-', ' '),
  });

  const allCompleted = dailyMissions.every(m => m.status === 'COMPLETED');

  const finalUser = await prisma.user.findUnique({ where: { id: user.id } });

  res.json({
    message: `Mission completed! You earned ${actualXpAdded} XP!`,
    xpEarned: actualXpAdded,
    newTotalXP: finalUser?.totalXP,
    newLevel: finalUser?.currentLevel,
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
    date.setHours(h || 0, (m || 0) + Config.SNOOZE_MINUTES, 0, 0);
    
    const newEnd = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    await prisma.mission.update({
        where: { id },
        data: {
            originalBracketEnd: mission.originalBracketEnd || mission.bracketEnd,
            bracketEnd: newEnd,
            snoozeCount: 1
        }
    });

    res.json({ message: `Mission snoozed for ${Config.SNOOZE_MINUTES} minutes!` });
});

router.post('/:id/validate', async (req, res) => {
    const { id } = req.params;
    const { steps } = req.body;
    const mission = await prisma.mission.findUnique({ where: { id } });

    if (!mission) return res.status(404).json({ error: 'Mission not found' });
    if (mission.status === 'COMPLETED') return res.status(400).json({ error: 'Already completed' });

    if (steps < Config.STEP_THRESHOLD_PER_MISSION) {
        return res.status(400).json({ error: `Physical activity not high enough for validation (need ${Config.STEP_THRESHOLD_PER_MISSION} steps)` });
    }

    await prisma.mission.update({
        where: { id },
        data: { status: 'COMPLETED', completedAt: new Date() }
    });

    const user = await prisma.user.findUnique({ where: { id: mission.userId } });
    if (user) {
        const actualXpAdded = await xpService.logXP(user.id, Config.XP_PER_MISSION_STEPS);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                currentLevel: gamificationService.calculateLevel(user.totalXP + actualXpAdded),
            }
        });
    }

    res.json({ message: 'Mission auto-validated based on physical activity!' });
});

router.post('/:id/refresh', async (req, res) => {
    const { id } = req.params;
    const userId = (req.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMissions = await prisma.mission.findMany({
        where: { userId, createdAt: { gte: today } }
    });

    try {
        const { mission, cooldownRemaining } = await missionService.refreshMission(user, id, currentMissions);

        if (cooldownRemaining) {
            return res.status(400).json({ error: `Refresh on cooldown. Wait ${cooldownRemaining} more minutes.` });
        }

        await prisma.mission.update({
            where: { id: mission.id },
            data: { exerciseId: mission.exerciseId }
        });

        await prisma.user.update({
            where: { id: userId },
            data: { lastRefreshTimestamp: new Date() }
        });

        res.json({ message: 'Mission refreshed successfully', mission });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/bonus', async (req, res) => {
    const userId = (req.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyMissions = await prisma.mission.findMany({
        where: { userId, createdAt: { gte: today } }
    });

    if (dailyMissions.filter(m => m.status === 'COMPLETED').length < Config.MAX_DAILY_MISSIONS) {
        return res.status(400).json({ error: `Complete your ${Config.MAX_DAILY_MISSIONS} daily missions first!` });
    }

    const usedExerciseIds = dailyMissions.map(m => m.exerciseId);

    const generated = await missionService.generateDailyMissions(user as any);
    const bonusEx = generated.find(m => !usedExerciseIds.includes(m.exerciseId)) || generated[0];

    const bonusMission = await prisma.mission.create({
        data: {
            id: `bonus-${Date.now()}`,
            userId,
            exerciseId: bonusEx.exerciseId,
            scheduledTime: new Date(),
            status: 'PENDING',
            bracketStart: '00:00',
            bracketEnd: '23:59',
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
