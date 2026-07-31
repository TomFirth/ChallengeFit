import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

import socialRoutes from './routes/social.js';
import missionRoutes from './routes/missions.js';

app.use(cors());
app.use(express.json());

app.use('/api/social', socialRoutes);
app.use('/api/missions', missionRoutes);

app.get('/', (req, res) => {
  res.send('Fitness Quest API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} and bound to 0.0.0.0`);
});
