import { Router } from 'express';
import { z } from 'zod';
import {
  createScore,
  createVariable,
  deleteVariable,
  listScores,
  listVariables,
  runSimulation,
  duplicateScore,
  publishScore,
  createRuleSet,
  listRuleSets,
  getVariableFacts,
  listVariableOptions,
  replaceVariableOptions,
  setVariableFacts,
  updateVariable,
  // added
  updateScore,
  deleteScore,
  getScoreVariables,
  setScoreVariables,
  listScoreOptions,
  replaceScoreOptions,
  listScoreFacts,
  replaceScoreFacts,
  listItems,
  createItem,
  updateItem,
  deleteItem,
  getScoreItemRatios,
  replaceScoreItemRatios,
  getVariableItemRatios,
  replaceVariableItemRatios,
  getItemVariableRatios,
  replaceItemVariableRatios,
  getItemScoreRatios,
  replaceItemScoreRatios,
  listAuths,
  createAuth,
  updateAuth,
  deleteAuth,
  getAuthItems,
  setAuthItems,
  listHokmYears,
  createHokmYear,
  updateHokmYear,
  deleteHokmYear,
  listHokmTypes,
  createHokmType,
  updateHokmType,
  deleteHokmType,
  listHokmTypeItems,
  replaceHokmTypeItems
} from './rules.service';
import {
  scoreInputSchema,
  simulationSchema,
  variableFactsSchema,
  variableInputSchema,
  variableOptionsUpsertSchema,
  variableUpdateSchema,
  // added
  scoreUpdateSchema,
  scoreVariablesSchema,
  scoreOptionsUpsertSchema,
  scoreFactsUpsertSchema,
  itemInputSchema,
  itemUpdateSchema,
  itemsRatioSchema,
  itemVariablesRatioSchema,
  itemScoresRatioSchema,
  authInputSchema,
  authUpdateSchema,
  authItemsSchema,
  hokmYearInputSchema,
  hokmTypeInputSchema,
  hokmTypeItemsSchema
} from './rules.schemas';

const rulesRouter = Router();

rulesRouter.get('/variables', async (_req, res) => {
  const rows = await listVariables();
  res.json(rows);
});

rulesRouter.post('/variables', async (req, res) => {
  const payload = variableInputSchema.parse(req.body);
  const variable = await createVariable(payload);
  res.status(201).json(variable);
});

rulesRouter.put('/variables/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = variableUpdateSchema.parse(req.body);
    await updateVariable(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.delete('/variables/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    await deleteVariable(id);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.get('/variables/:id/facts', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const factIds = await getVariableFacts(id);
    res.json({ factIds });
  } catch (e) {
    next(e);
  }
});

rulesRouter.put('/variables/:id/facts', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = variableFactsSchema.parse(req.body);
    await setVariableFacts(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.get('/variables/:id/options', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const rows = await listVariableOptions(id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

rulesRouter.put('/variables/:id/options', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = variableOptionsUpsertSchema.parse(req.body);
    await replaceVariableOptions(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.get('/scores', async (_req, res) => {
  const rows = await listScores();
  res.json(rows);
});

rulesRouter.post('/scores', async (req, res) => {
  const payload = scoreInputSchema.parse(req.body);
  const score = await createScore(payload);
  res.status(201).json(score);
});

rulesRouter.put('/scores/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = scoreUpdateSchema.parse(req.body);
    await updateScore(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.delete('/scores/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    await deleteScore(id);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.post('/scores/:id/duplicate', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const dup = await duplicateScore(id);
    res.status(201).json(dup);
  } catch (error) {
    next(error);
  }
});

rulesRouter.post('/scores/:id/publish', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    await publishScore(id);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.get('/scores/:id/variables', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const ids = await getScoreVariables(id);
    res.json({ variableIds: ids });
  } catch (e) {
    next(e);
  }
});

rulesRouter.put('/scores/:id/variables', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = scoreVariablesSchema.parse(req.body);
    await setScoreVariables(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.get('/scores/:id/options', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const rows = await listScoreOptions(id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

rulesRouter.put('/scores/:id/options', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = scoreOptionsUpsertSchema.parse(req.body);
    await replaceScoreOptions(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.get('/scores/:id/facts', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const rows = await listScoreFacts(id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

rulesRouter.put('/scores/:id/facts', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = scoreFactsUpsertSchema.parse(req.body);
    await replaceScoreFacts(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.post('/simulate', async (req, res) => {
  const payload = simulationSchema.parse(req.body);
  const result = await runSimulation(payload);
  res.json(result);
});

rulesRouter.get('/rule-sets', async (_req, res) => {
  const data = await listRuleSets();
  res.json(data);
});

rulesRouter.post('/rule-sets', async (req, res) => {
  const schema = z.object({ name: z.string().min(2), description: z.string().optional() });
  const payload = schema.parse(req.body);
  const created = await createRuleSet(payload.name, payload.description);
  res.status(201).json(created);
});

// Items
rulesRouter.get('/items', async (_req, res) => {
  const rows = await listItems();
  res.json(rows);
});

rulesRouter.post('/items', async (req, res) => {
  const payload = itemInputSchema.parse(req.body);
  const created = await createItem(payload);
  res.status(201).json(created);
});

rulesRouter.put('/items/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = itemUpdateSchema.parse(req.body);
    await updateItem(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.delete('/items/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    await deleteItem(id);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.get('/scores/:id/items-ratio', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const rows = await getScoreItemRatios(id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

rulesRouter.put('/scores/:id/items-ratio', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = itemsRatioSchema.parse(req.body);
    await replaceScoreItemRatios(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.get('/variables/:id/items-ratio', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const rows = await getVariableItemRatios(id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

rulesRouter.put('/variables/:id/items-ratio', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = itemsRatioSchema.parse(req.body);
    await replaceVariableItemRatios(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

// Items-side ratios
rulesRouter.get('/items/:id/variables-ratio', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const rows = await getItemVariableRatios(id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

rulesRouter.put('/items/:id/variables-ratio', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = itemVariablesRatioSchema.parse(req.body);
    await replaceItemVariableRatios(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.get('/items/:id/scores-ratio', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const rows = await getItemScoreRatios(id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

rulesRouter.put('/items/:id/scores-ratio', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = itemScoresRatioSchema.parse(req.body);
    await replaceItemScoreRatios(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

// Auths
rulesRouter.get('/auths', async (_req, res) => {
  const rows = await listAuths();
  res.json(rows);
});

rulesRouter.post('/auths', async (req, res) => {
  const payload = authInputSchema.parse(req.body);
  const created = await createAuth(payload);
  res.status(201).json(created);
});

rulesRouter.put('/auths/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = authUpdateSchema.parse(req.body);
    await updateAuth(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.delete('/auths/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    await deleteAuth(id);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.get('/auths/:id/items', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const itemIds = await getAuthItems(id);
    res.json({ itemIds });
  } catch (e) {
    next(e);
  }
});

rulesRouter.put('/auths/:id/items', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = authItemsSchema.parse(req.body);
    await setAuthItems(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

// Hokm
rulesRouter.get('/hokm/years', async (_req, res) => {
  const rows = await listHokmYears();
  res.json(rows);
});

rulesRouter.post('/hokm/years', async (req, res) => {
  const payload = hokmYearInputSchema.parse(req.body);
  const created = await createHokmYear(payload);
  res.status(201).json(created);
});

rulesRouter.put('/hokm/years/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = hokmYearInputSchema.parse(req.body);
    await updateHokmYear(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.delete('/hokm/years/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    await deleteHokmYear(id);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.get('/hokm/types', async (_req, res) => {
  const rows = await listHokmTypes();
  res.json(rows);
});

rulesRouter.post('/hokm/types', async (req, res) => {
  const payload = hokmTypeInputSchema.parse(req.body);
  const created = await createHokmType(payload);
  res.status(201).json(created);
});

rulesRouter.put('/hokm/types/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = hokmTypeInputSchema.parse(req.body);
    await updateHokmType(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.delete('/hokm/types/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    await deleteHokmType(id);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.get('/hokm/types/:id/items', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const rows = await listHokmTypeItems(id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

rulesRouter.put('/hokm/types/:id/items', async (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
  try {
    const payload = hokmTypeItemsSchema.parse(req.body);
    await replaceHokmTypeItems(id, payload);
    res.json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
});

rulesRouter.use((err: unknown, _req, res, next) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ message: 'Validation error', details: err.flatten() });
    return;
  }
  next(err);
});

export { rulesRouter };
