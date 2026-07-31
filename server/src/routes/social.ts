import { Router } from 'express';
import { FeedService } from '../services/FeedService.js';
import { GroupService } from '../services/GroupService.js';
import { XPService } from '../services/XPService.js';
import { prisma } from '../services/PrismaClient.js';

const router = Router();
export const feedService = new FeedService();
const groupService = new GroupService();
const xpService = new XPService();

// List friends (Mocked for now as we don't have a friend table yet, just user IDs)
router.get('/friends', async (req, res) => {
  const users = await prisma.user.findMany({
      where: { NOT: { id: 'u1' } },
      take: 5
  });
  res.json(users);
});

// Groups
router.post('/groups', async (req, res) => {
  const { name, memberIds } = req.body;
  const ownerId = 'u1';
  const group = await groupService.createGroup(name, ownerId, memberIds);
  res.json(group);
});

router.get('/groups', async (req, res) => {
  const groups = await groupService.getGroups('u1');
  res.json(groups);
});

router.get('/groups/:id/leaderboard', async (req, res) => {
  const group = await groupService.getGroup(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const startDate = group.createdAt;

  const leaderboard = await Promise.all(group.members.map(async (user: any) => {
    const periodXP = await xpService.getXPForUser(user.id, startDate);

    // For mock data feel, if XP is 0, show a small amount for others
    let displayXP = periodXP;
    if (user.id !== 'u1' && periodXP === 0) {
        displayXP = Math.floor(Math.random() * 200);
    }

    return {
      ...user,
      xp: displayXP,
    };
  }));

  leaderboard.sort((a: any, b: any) => b.xp - a.xp);
  res.json(leaderboard);
});

// Get friend feed
router.get('/feed', (req, res) => {
  res.json(feedService.getFeed(['u2', 'u3']));
});

// Get global leaderboards
router.get('/leaderboard', async (req, res) => {
  const users = await prisma.user.findMany({
      orderBy: { totalXP: 'desc' },
      take: 20
  });

  res.json(users.map(u => ({
      ...u,
      xp: u.totalXP,
      streak: u.currentStreak,
      level: u.currentLevel
  })));
});

export default router;
