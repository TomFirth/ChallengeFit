import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import './config/passport.js';

dotenv.config();

const app = express();

import authRoutes from './routes/auth.js';
import socialRoutes from './routes/social.js';
import missionRoutes from './routes/missions.js';
import { protect } from './middleware/auth.js';

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/social', protect, socialRoutes);
app.use('/api/missions', protect, missionRoutes);

app.get('/', (req, res) => {
  res.send('Challenge Fit API is running');
});

const PORT = process.env.PORT || 3001;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} and bound to 0.0.0.0`);
});
