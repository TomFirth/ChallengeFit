import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { prisma } from '../services/PrismaClient.js';

const router = Router();

const generateToken = (user: any) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });
};

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register' });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ error: info.message });

    const token = generateToken(user);
    res.json({ token, user });
  })(req, res, next);
});

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = generateToken(req.user);
  // In a real mobile app, we might redirect to a custom scheme
  res.redirect(`fitnessquest://auth?token=${token}`);
});

// Facebook Auth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), (req, res) => {
  const token = generateToken(req.user);
  res.redirect(`fitnessquest://auth?token=${token}`);
});

// Get Profile
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user);
});

export default router;
