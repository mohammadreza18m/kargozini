import { z } from 'zod';

export const personCreateSchema = z.object({
  kindId: z.number().int().optional(),
  kindName: z.string().optional(),
  name: z.string().min(1)
});

export type PersonCreateInput = z.infer<typeof personCreateSchema>;

export const attributeUpsertSchema = z.object({
  attributeId: z.number().int(),
  memberRowId: z.number().int().optional(),
  valueString: z.string().optional(),
  valueReal: z.number().optional(),
  valueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  valueBool: z.boolean().optional(),
  valueJson: z.any().optional(),
  optionRowId: z.number().int().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  updatedBy: z.string().optional()
});

export type AttributeUpsertInput = z.infer<typeof attributeUpsertSchema>;

export const personVariableUpsertSchema = z.object({
  variableRowId: z.number().int(),
  optionRowId: z.number().int(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  updatedBy: z.string().optional()
});

export type PersonVariableUpsertInput = z.infer<typeof personVariableUpsertSchema>;
