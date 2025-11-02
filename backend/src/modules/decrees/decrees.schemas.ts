import { z } from 'zod';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const decreePreviewSchema = z.object({
  personId: z.number().int(),
  effectiveDate: isoDateSchema,
  variableValues: z.record(z.number()),
  manualOverrides: z
    .array(
      z.object({
        itemId: z.number().int(),
        value: z.number(),
        reason: z.string().min(3)
      })
    )
    .default([]),
  hokmTypeRowId: z.number().int().optional(),
  notes: z.string().optional()
});

export type DecreePreviewInput = z.infer<typeof decreePreviewSchema>;
