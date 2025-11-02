import { Router } from 'express';
import {
  reportAverageSalary,
  reportDecreeIssuance,
  reportOverrideAlerts
} from './reports.service';

const reportsRouter = Router();

reportsRouter.get('/decrees', async (_req, res) => {
  const data = await reportDecreeIssuance();
  res.json(data);
});

reportsRouter.get('/salary-distribution', async (_req, res) => {
  const data = await reportAverageSalary();
  res.json(data);
});

reportsRouter.get('/alerts', async (_req, res) => {
  const data = await reportOverrideAlerts();
  res.json(data);
});

export { reportsRouter };
