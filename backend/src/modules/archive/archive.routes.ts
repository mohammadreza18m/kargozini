import { Router } from 'express';
import { z } from 'zod';
import {
  compareDecrees,
  searchArchive
} from './archive.service';

const archiveRouter = Router();

archiveRouter.get('/', async (req, res) => {
  const result = await searchArchive({
    personId: req.query.personId ? Number(req.query.personId) : undefined,
    issuedFrom: req.query.issuedFrom ? String(req.query.issuedFrom) : undefined,
    issuedTo: req.query.issuedTo ? String(req.query.issuedTo) : undefined
  });

  res.json(
    result.map((row) => ({
      rowId: row.row_id,
      salaryNo: row.salary_no,
      personRef: row.pr_rand_id,
      issuedAt: row.cr.toISOString(),
      effectiveDate: row.affected_date?.toISOString() ?? null
    }))
  );
});

archiveRouter.get('/compare', async (req, res) => {
  const schema = z.object({
    leftId: z.coerce.number().int(),
    rightId: z.coerce.number().int()
  });
  const payload = schema.parse(req.query);
  const diff = await compareDecrees(payload.leftId, payload.rightId);
  res.json(diff);
});

archiveRouter.use((err: unknown, _req, res, next) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ message: 'Validation error', details: err.flatten() });
    return;
  }
  next(err);
});

export { archiveRouter };
