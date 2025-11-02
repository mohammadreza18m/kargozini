import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import {
  attributeCreateSchema,
  attributeUpdateSchema,
  dependencySchema,
  entityCreateSchema,
  entityKindCreateSchema
} from './attributes.schemas';
import {
  createAttribute,
  createAttributeOption,
  createEntity,
  createEntityKind,
  deleteAttribute,
  deleteAttributeOption,
  deleteEntity,
  deleteEntityKind,
  getAttributeHistory,
  listAttributeCategories,
  listAttributeOptions,
  listAttributes,
  listEntities,
  listEntityKinds,
  updateAttribute,
  updateAttributeOption,
  updateEntity,
  updateEntityKind,
  upsertDependency
} from './attributes.service';

const attributesRouter = Router();

attributesRouter.get('/', async (req: Request, res: Response) => {
  const kindId = req.query.kindId ? Number(req.query.kindId) : undefined;
  if (kindId !== undefined && Number.isNaN(kindId)) {
    res.status(400).json({ message: 'Invalid kindId' });
    return;
  }
  const attributes = await listAttributes(kindId);
  res.json(attributes);
});

attributesRouter.get('/categories', async (_req: Request, res: Response) => {
  const categories = await listAttributeCategories();
  res.json(categories);
});

attributesRouter.get('/entity-kinds', async (_req: Request, res: Response) => {
  const kinds = await listEntityKinds();
  res.json(kinds);
});

attributesRouter.post('/entity-kinds', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = entityKindCreateSchema.parse(req.body);
    const created = await createEntityKind(payload);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

attributesRouter.put('/entity-kinds/:id', async (req: Request, res: Response, next: NextFunction) => {
  const kindId = Number(req.params.id);
  if (Number.isNaN(kindId)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  try {
    const payload = entityKindCreateSchema.parse(req.body);
    await updateEntityKind(kindId, payload);
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

attributesRouter.delete('/entity-kinds/:id', async (req: Request, res: Response, next: NextFunction) => {
  const kindId = Number(req.params.id);
  if (Number.isNaN(kindId)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  try {
    await deleteEntityKind(kindId);
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

attributesRouter.get('/entities', async (req: Request, res: Response) => {
  const kindId = req.query.kindId ? Number(req.query.kindId) : undefined;
  if (kindId !== undefined && Number.isNaN(kindId)) {
    res.status(400).json({ message: 'Invalid kindId' });
    return;
  }
  const entities = await listEntities(kindId);
  res.json(entities);
});

attributesRouter.post('/entities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = entityCreateSchema.parse(req.body);
    const created = await createEntity(payload);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

attributesRouter.put('/entities/:id', async (req: Request, res: Response, next: NextFunction) => {
  const entityId = Number(req.params.id);
  if (Number.isNaN(entityId)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  try {
    const payload = entityCreateSchema.parse(req.body);
    await updateEntity(entityId, payload);
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

attributesRouter.delete('/entities/:id', async (req: Request, res: Response, next: NextFunction) => {
  const entityId = Number(req.params.id);
  if (Number.isNaN(entityId)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  try {
    await deleteEntity(entityId);
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

attributesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = attributeCreateSchema.parse(req.body);
    const created = await createAttribute(payload);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

attributesRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const attributeId = Number(req.params.id);
  if (Number.isNaN(attributeId)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  try {
    const payload = attributeUpdateSchema.parse(req.body);
    await updateAttribute(attributeId, payload);
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

attributesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const attributeId = Number(req.params.id);
  if (Number.isNaN(attributeId)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  try {
    await deleteAttribute(attributeId);
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

attributesRouter.post('/dependencies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = dependencySchema.parse(req.body);
    await upsertDependency(payload);
    res.status(201).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

attributesRouter.get('/:id/history/:entityId', async (req: Request, res: Response, next: NextFunction) => {
  const attributeId = Number(req.params.id);
  const entityId = Number(req.params.entityId);
  if (Number.isNaN(attributeId) || Number.isNaN(entityId)) {
    res.status(400).json({ message: 'Invalid parameters' });
    return;
  }
  try {
    const history = await getAttributeHistory(attributeId, entityId);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

attributesRouter.get('/:id/options', async (req: Request, res: Response, next: NextFunction) => {
  const attributeId = Number(req.params.id);
  if (Number.isNaN(attributeId)) {
    res.status(400).json({ message: 'Invalid attribute id' });
    return;
  }
  try {
    const options = await listAttributeOptions(attributeId);
    res.json(options);
  } catch (error) {
    next(error);
  }
});

attributesRouter.post('/:id/options', async (req: Request, res: Response, next: NextFunction) => {
  const attributeId = Number(req.params.id);
  if (Number.isNaN(attributeId)) {
    res.status(400).json({ message: 'Invalid attribute id' });
    return;
  }
  const schema = z.object({ value: z.string().min(1) });
  try {
    const payload = schema.parse(req.body);
    const created = await createAttributeOption(attributeId, payload.value);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

attributesRouter.put('/options/:optionId', async (req: Request, res: Response, next: NextFunction) => {
  const optionId = Number(req.params.optionId);
  if (Number.isNaN(optionId)) {
    res.status(400).json({ message: 'Invalid option id' });
    return;
  }
  const schema = z.object({ value: z.string().min(1) });
  try {
    const payload = schema.parse(req.body);
    await updateAttributeOption(optionId, payload.value);
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

attributesRouter.delete('/options/:optionId', async (req: Request, res: Response, next: NextFunction) => {
  const optionId = Number(req.params.optionId);
  if (Number.isNaN(optionId)) {
    res.status(400).json({ message: 'Invalid option id' });
    return;
  }
  try {
    await deleteAttributeOption(optionId);
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

attributesRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ message: 'Validation error', details: err.flatten() });
    return;
  }
  next(err);
});

export { attributesRouter };
