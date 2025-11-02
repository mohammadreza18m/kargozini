import { z } from 'zod';

const dataTypeSchema = z.enum(['string', 'real', 'date', 'bool', 'json']);

export const attributeCreateSchema = z.object({
  kindId: z.number().int(),
  contextRowId: z.number().int(),
  name: z.string().min(2),
  displayName: z.string().min(2),
  description: z.string().optional(),
  category: z.string().min(2),
  dataType: dataTypeSchema,
  defaultValue: z.any().optional(),
  validationRules: z
    .object({
      required: z.boolean().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      options: z.array(z.any()).optional()
    })
    .optional(),
  isVisible: z.boolean().default(true),
  isEditable: z.boolean().default(true),
  isSystem: z.boolean().default(false),
  dependsOnAttributeId: z.number().int().optional(),
  dependsOnValue: z.any().optional()
});

export const attributeUpdateSchema = attributeCreateSchema.partial();

export const dependencySchema = z.object({
  attributeId: z.number().int(),
  dependsOnAttributeId: z.number().int(),
  condition: z.record(z.any()).optional()
});

export const attributeValueSchema = z.object({
  valueString: z.string().optional(),
  valueReal: z.number().optional(),
  valueDate: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Date must be YYYY-MM-DD format')
    .optional(),
  valueBool: z.boolean().optional(),
  valueJson: z.any().optional(),
  startTime: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
    .optional()
});

export type AttributeCreateInput = z.infer<typeof attributeCreateSchema>;
export type AttributeUpdateInput = z.infer<typeof attributeUpdateSchema>;
export type DependencyInput = z.infer<typeof dependencySchema>;

export const entityKindCreateSchema = z.object({
  kindName: z.string().min(2, 'kindName must be at least 2 characters long')
});

export type EntityKindCreateInput = z.infer<typeof entityKindCreateSchema>;

export const entityCreateSchema = z.object({
  kindId: z.number().int(),
  name: z.string().min(2)
});

export type EntityCreateInput = z.infer<typeof entityCreateSchema>;
