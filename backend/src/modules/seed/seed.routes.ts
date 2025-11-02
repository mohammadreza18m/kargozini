import { Router } from 'express';
import { runSeed } from './seed.service';

const seedRouter = Router();

seedRouter.post('/', async (_req, res) => {
  await runSeed();
  res.json({ status: 'ok' });
});

export { seedRouter };
