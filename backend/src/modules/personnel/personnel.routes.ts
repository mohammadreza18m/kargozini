import { Router } from 'express';
import { z } from 'zod';
import {
  createPerson,
  getPerson,
  listPersonnel,
  upsertPersonAttribute
} from './personnel.service';
import {
  attributeUpsertSchema,
  personCreateSchema
} from './personnel.schemas';

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
  const person = await getPerson(id);
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

personnelRouter.use((err: unknown, _req, res, next) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ message: 'Validation error', details: err.flatten() });
    return;
  }
  next(err);
});

export { personnelRouter };
