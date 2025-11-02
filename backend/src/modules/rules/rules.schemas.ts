import { z } from 'zod';

export const variableInputSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  variableVop: z.enum(['value', 'percent']),
  som: z.enum(['condition', 'combination']),
  valueMin: z.number().nullable().optional(),
  valueMax: z.number().nullable().optional(),
  valueDefault: z.number().nullable().optional(),
  startTime: z.string().datetime().nullable().optional(),
  endTime: z.string().datetime().nullable().optional()
});

export type VariableInput = z.infer<typeof variableInputSchema>;

export const variableUpdateSchema = variableInputSchema.partial();
export type VariableUpdateInput = z.infer<typeof variableUpdateSchema>;

export const variableFactsSchema = z.object({
  factIds: z.array(z.number().int()).default([])
});
export type VariableFactsInput = z.infer<typeof variableFactsSchema>;

export const variableOptionsUpsertSchema = z.object({
  rows: z
    .array(
      z.object({
        composition: z.string().min(1),
        value: z.string().min(1)
      })
    )
    .default([])
});
export type VariableOptionsUpsertInput = z.infer<typeof variableOptionsUpsertSchema>;

export const scoreInputSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  formula: z.string().min(1),
  condition: z.string().optional(),
  category: z.string().optional(),
  ruleSetRowId: z.number().int().optional(),
  scoreVopSom: z.enum(['value', 'percent']),
  som: z.enum(['condition', 'combination']),
  valueMin: z.number().nullable().optional(),
  valueMax: z.number().nullable().optional(),
  valueDefault: z.number().nullable().optional(),
  startTime: z.string().datetime().nullable().optional(),
  endTime: z.string().datetime().nullable().optional(),
  variableIds: z.array(z.number().int()).default([])
});

export type ScoreInput = z.infer<typeof scoreInputSchema>;

export const scoreUpdateSchema = scoreInputSchema.partial();
export type ScoreUpdateInput = z.infer<typeof scoreUpdateSchema>;

export const scoreVariablesSchema = z.object({
  variableIds: z.array(z.number().int()).default([])
});
export type ScoreVariablesInput = z.infer<typeof scoreVariablesSchema>;

export const scoreFactsUpsertSchema = z.object({
  rows: z
    .array(
      z.object({
        factRowId: z.number().int(),
        name: z.string().optional(),
        description: z.string().optional(),
        ord: z.number().int().optional()
      })
    )
    .default([])
});
export type ScoreFactsUpsertInput = z.infer<typeof scoreFactsUpsertSchema>;

export const scoreOptionsUpsertSchema = z.object({
  rows: z
    .array(
      z.object({ composition: z.string().min(1), value: z.number() })
    )
    .default([])
});
export type ScoreOptionsUpsertInput = z.infer<typeof scoreOptionsUpsertSchema>;

// Items CRUD
export const itemInputSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  valueMin: z.number().nullable().optional(),
  valueMax: z.number().nullable().optional(),
  valueDefault: z.number().nullable().optional()
});
export type ItemInput = z.infer<typeof itemInputSchema>;
export const itemUpdateSchema = itemInputSchema.partial();
export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>;

export const itemsRatioSchema = z.object({
  rows: z.array(z.object({ itemRowId: z.number().int(), value: z.number() })).default([])
});
export type ItemsRatioInput = z.infer<typeof itemsRatioSchema>;

// Ratios by item (set variable/score ratios for a single item)
export const itemVariablesRatioSchema = z.object({
  rows: z.array(z.object({ variableRowId: z.number().int(), value: z.number() })).default([])
});
export type ItemVariablesRatioInput = z.infer<typeof itemVariablesRatioSchema>;

export const itemScoresRatioSchema = z.object({
  rows: z.array(z.object({ scoreRowId: z.number().int(), value: z.number() })).default([])
});
export type ItemScoresRatioInput = z.infer<typeof itemScoresRatioSchema>;

// Auths
export const authInputSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  percent: z.number().nullable().optional()
});
export type AuthInput = z.infer<typeof authInputSchema>;
export const authUpdateSchema = authInputSchema.partial();
export type AuthUpdateInput = z.infer<typeof authUpdateSchema>;
export const authItemsSchema = z.object({ itemIds: z.array(z.number().int()).default([]) });
export type AuthItemsInput = z.infer<typeof authItemsSchema>;

// Hokm
export const hokmYearInputSchema = z.object({
  year: z.number().int(),
  yearpercent: z.number()
});
export type HokmYearInput = z.infer<typeof hokmYearInputSchema>;
export const hokmTypeInputSchema = z.object({ title: z.string().min(2) });
export type HokmTypeInput = z.infer<typeof hokmTypeInputSchema>;
export const hokmTypeItemsSchema = z.object({
  rows: z.array(z.object({ itemRowId: z.number().int(), percent: z.number() })).default([])
});
export type HokmTypeItemsInput = z.infer<typeof hokmTypeItemsSchema>;

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const simulationSchema = z.object({
  effectiveDate: isoDateSchema,
  category: z.string().optional(),
  variableValues: z.record(z.number()),
  manualOverrides: z
    .array(
      z.object({
        itemId: z.number().int(),
        value: z.number(),
        reason: z.string().min(3)
      })
    )
    .default([])
});

export type SimulationInput = z.infer<typeof simulationSchema>;
