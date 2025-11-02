import { Router } from 'express';
import { z } from 'zod';
import {
  finalizeDecree,
  listDecrees,
  previewDecree
} from './decrees.service';
import { decreePreviewSchema } from './decrees.schemas';

const decreesRouter = Router();

decreesRouter.get('/', async (req, res) => {
  const personId = req.query.personId ? Number(req.query.personId) : undefined;
  const rows = await listDecrees(personId);
  res.json(
    rows.map((row) => ({
      rowId: row.row_id,
      salaryNo: row.salary_no,
      effectiveDate: row.affected_date?.toISOString() ?? null,
      hokmTypeRowId: row.hokm_type_row_id,
      createdAt: row.cr.toISOString()
    }))
  );
});

decreesRouter.post('/preview', async (req, res) => {
  const payload = decreePreviewSchema.parse(req.body);
  const result = await previewDecree(payload);
  res.json(result);
});

decreesRouter.post('/', async (req, res) => {
  const payload = decreePreviewSchema.parse(req.body);
  const result = await finalizeDecree(payload);
  res.status(201).json(result);
});

decreesRouter.use((err: unknown, _req, res, next) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ message: 'Validation error', details: err.flatten() });
    return;
  }
  next(err);
});

export { decreesRouter };
