import { Router } from 'express';
import { z } from 'zod';
import { createPerson, getPerson, listPersonnel, upsertPersonAttribute, calcHokmItems, upsertPersonVariableValue, listEntityMembers, addEntityMember } from './personnel.service';
import { attributeUpsertSchema, personCreateSchema, personVariableUpsertSchema } from './personnel.schemas';

const personnelRouter = Router();

personnelRouter.get('/', async (_req, res) => {
  const people = await listPersonnel();
  res.json(people);
});

personnelRouter.post('/', async (req, res) => {
  const payload = personCreateSchema.parse(req.body);
  const person = await createPerson(payload);
  res.status(201).json(person);
});

personnelRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  const memberRowId = req.query.memberRowId ? Number(req.query.memberRowId) : undefined;
  const person = await getPerson(id, { memberRowId: memberRowId ?? null });
  if (!person) {
    res.status(404).json({ message: 'Person not found' });
    return;
  }
  res.json(person);
});

personnelRouter.put('/:id/attributes', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  const payload = attributeUpsertSchema.parse(req.body);
  await upsertPersonAttribute(id, payload);
  const person = await getPerson(id);
  res.json(person);
});

personnelRouter.post('/:id/hokm', async (req, res, next) => {
  const id = Number(req.params.id);
  const schema = z.object({ year: z.number().int() });
  try {
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    const { year } = schema.parse(req.body);
    const rows = await calcHokmItems(id, year);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

personnelRouter.put('/:id/variables', async (req, res, next) => {
  const id = Number(req.params.id);
  try {
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    const payload = personVariableUpsertSchema.parse(req.body);
    await upsertPersonVariableValue(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

personnelRouter.get('/:id/members', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    const rows = await listEntityMembers(id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

personnelRouter.post('/:id/members', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    const row = await addEntityMember(id);
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

personnelRouter.use((err: unknown, _req, res, next) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ message: 'Validation error', details: err.flatten() });
    return;
  }
  next(err);
});

export { personnelRouter };
