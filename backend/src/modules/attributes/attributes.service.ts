import { randomUUID } from 'crypto';
import { query } from '../../db/pool';
import { withTransaction } from '../../db/transaction';
import type {
  AttributeCreateInput,
  AttributeUpdateInput,
  DependencyInput,
  EntityCreateInput,
  EntityKindCreateInput
} from './attributes.schemas';

export interface AttributeDependency {
  attributeId: number;
  dependsOnAttributeId: number;
  condition: Record<string, unknown> | null;
}

export interface AttributeRecord {
  rowId: number;
  kindId: number;
  contextRowId: number;
  name: string;
  displayName: string | null;
  description: string | null;
  category: string | null;
  dataType: string;
  defaultValue: unknown;
  validationRules: Record<string, unknown> | null;
  isVisible: boolean;
  isEditable: boolean;
  isSystem: boolean;
  dependsOnAttributeId: number | null;
  dependsOnValue: unknown;
  dependencies: AttributeDependency[];
}

export async function listAttributes(kindId?: number): Promise<AttributeRecord[]> {
  const rows = await query<{
    row_id: number;
    kind_id: number;
    context_row_id: number;
    attribute_name: string;
    display_name: string | null;
    description: string | null;
    category: string | null;
    data_type: string;
    default_value: unknown;
    validation_rules: Record<string, unknown> | null;
    is_visible: boolean;
    is_editable: boolean;
    is_system: boolean;
    depends_on_attribute_id: number | null;
    depends_on_value: unknown;
  }>(
    `SELECT row_id, kind_id, context_row_id, attribute_name, display_name, description, category,
            data_type, default_value, validation_rules, is_visible, is_editable, is_system,
            depends_on_attribute_id, depends_on_value
       FROM var.attribute_def
      WHERE $1::int IS NULL OR kind_id = $1
      ORDER BY category NULLS LAST, display_name NULLS LAST, attribute_name`.
    trim(),
    [kindId ?? null]
  );

  const ids = rows.map((row) => row.row_id);
  const dependencyRows = ids.length
    ? await query<{
        attribute_id: number;
        depends_on_attribute_id: number;
        condition: Record<string, unknown> | null;
      }>(
        `SELECT attribute_id, depends_on_attribute_id, condition
           FROM var.attribute_dependencies
          WHERE attribute_id = ANY($1::int[])`,
        [ids]
      )
    : [];

  return rows.map((row) => ({
    rowId: row.row_id,
    kindId: row.kind_id,
    contextRowId: row.context_row_id,
    name: row.attribute_name,
    displayName: row.display_name,
    description: row.description,
    category: row.category,
    dataType: row.data_type,
    defaultValue: row.default_value,
    validationRules: row.validation_rules,
    isVisible: row.is_visible ?? true,
    isEditable: row.is_editable ?? true,
    isSystem: row.is_system ?? false,
    dependsOnAttributeId: row.depends_on_attribute_id,
    dependsOnValue: row.depends_on_value,
    dependencies: dependencyRows
      .filter((dep) => dep.attribute_id === row.row_id)
      .map((dep) => ({
        attributeId: dep.attribute_id,
        dependsOnAttributeId: dep.depends_on_attribute_id,
        condition: dep.condition
      }))
  }));
}

export async function createAttribute(input: AttributeCreateInput): Promise<AttributeRecord> {
  return withTransaction(async (client) => {
    const inserted = await client.query<{
      row_id: number;
      kind_id: number;
      context_row_id: number;
      attribute_name: string;
      display_name: string | null;
      description: string | null;
      category: string | null;
      data_type: string;
      default_value: unknown;
      validation_rules: Record<string, unknown> | null;
      is_visible: boolean;
      is_editable: boolean;
      is_system: boolean;
      depends_on_attribute_id: number | null;
      depends_on_value: unknown;
    }>(
      `INSERT INTO var.attribute_def
        (rand_id, kind_id, context_row_id, attribute_name, display_name, description, category, data_type,
         default_value, validation_rules, is_visible, is_editable, is_system, depends_on_attribute_id, depends_on_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12, $13, $14, $15::jsonb)
       RETURNING row_id, kind_id, context_row_id, attribute_name, display_name, description, category, data_type,
                 default_value, validation_rules, is_visible, is_editable, is_system, depends_on_attribute_id, depends_on_value`,
      [
        randomUUID(),
        input.kindId,
        input.contextRowId,
        input.name,
        input.displayName,
        input.description ?? null,
        input.category ?? null,
        input.dataType,
        input.defaultValue ?? null,
        input.validationRules ?? null,
        input.isVisible,
        input.isEditable,
        input.isSystem,
        input.dependsOnAttributeId ?? null,
        input.dependsOnValue ?? null
      ]
    );

    if (input.dependsOnAttributeId) {
      await client.query(
        `INSERT INTO var.attribute_dependencies
           (attribute_id, depends_on_attribute_id, condition)
         VALUES ($1, $2, $3::jsonb)
         ON CONFLICT (attribute_id, depends_on_attribute_id)
         DO UPDATE SET condition = EXCLUDED.condition`,
        [inserted.rows[0].row_id, input.dependsOnAttributeId, input.dependsOnValue ?? null]
      );
    }

    return {
      rowId: inserted.rows[0].row_id,
      kindId: inserted.rows[0].kind_id,
      contextRowId: inserted.rows[0].context_row_id,
      name: inserted.rows[0].attribute_name,
      displayName: inserted.rows[0].display_name,
      description: inserted.rows[0].description,
      category: inserted.rows[0].category,
      dataType: inserted.rows[0].data_type,
      defaultValue: inserted.rows[0].default_value,
      validationRules: inserted.rows[0].validation_rules,
      isVisible: inserted.rows[0].is_visible ?? true,
      isEditable: inserted.rows[0].is_editable ?? true,
      isSystem: inserted.rows[0].is_system ?? false,
      dependsOnAttributeId: inserted.rows[0].depends_on_attribute_id,
      dependsOnValue: inserted.rows[0].depends_on_value,
      dependencies: input.dependsOnAttributeId
        ? [
            {
              attributeId: inserted.rows[0].row_id,
              dependsOnAttributeId: input.dependsOnAttributeId,
              condition: (input.dependsOnValue as Record<string, unknown>) ?? null
            }
          ]
        : []
    };
  });
}

export async function updateAttribute(
  attributeId: number,
  input: AttributeUpdateInput
): Promise<void> {
  await withTransaction(async (client) => {
    const result = await client.query<unknown>(
      `UPDATE var.attribute_def
          SET display_name = COALESCE($2, display_name),
              description = COALESCE($3, description),
              category = COALESCE($4, category),
              data_type = COALESCE($5, data_type),
              default_value = COALESCE($6::jsonb, default_value),
              validation_rules = COALESCE($7::jsonb, validation_rules),
              is_visible = COALESCE($8, is_visible),
              is_editable = COALESCE($9, is_editable),
              is_system = COALESCE($10, is_system),
              depends_on_attribute_id = COALESCE($11, depends_on_attribute_id),
              depends_on_value = COALESCE($12::jsonb, depends_on_value),
              up = now()
        WHERE row_id = $1`,
      [
        attributeId,
        input.displayName ?? null,
        input.description ?? null,
        input.category ?? null,
        input.dataType ?? null,
        input.defaultValue ?? null,
        input.validationRules ?? null,
        input.isVisible ?? null,
        input.isEditable ?? null,
        input.isSystem ?? null,
        input.dependsOnAttributeId ?? null,
        input.dependsOnValue ?? null
      ]
    );

    if ((input.dependsOnAttributeId ?? input.dependsOnValue) !== undefined) {
      if (input.dependsOnAttributeId) {
        await client.query(
          `INSERT INTO var.attribute_dependencies
             (attribute_id, depends_on_attribute_id, condition)
           VALUES ($1, $2, $3::jsonb)
           ON CONFLICT (attribute_id, depends_on_attribute_id)
           DO UPDATE SET condition = EXCLUDED.condition`,
          [attributeId, input.dependsOnAttributeId, input.dependsOnValue ?? null]
        );
      } else {
        await client.query(
          `DELETE FROM var.attribute_dependencies WHERE attribute_id = $1`,
          [attributeId]
        );
      }
    }

    return result;
  });
}

export async function upsertDependency(input: DependencyInput): Promise<void> {
  await query(
    `INSERT INTO var.attribute_dependencies (attribute_id, depends_on_attribute_id, condition)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (attribute_id, depends_on_attribute_id)
     DO UPDATE SET condition = EXCLUDED.condition`,
    [input.attributeId, input.dependsOnAttributeId, input.condition ?? null]
  );
}

export async function listAttributeCategories(): Promise<string[]> {
  const rows = await query<{ category: string | null }>(
    `SELECT DISTINCT category FROM var.attribute_def WHERE category IS NOT NULL ORDER BY category`
  );
  return rows.map((row) => row.category!).filter(Boolean);
}

export interface AttributeHistoryRecord {
  value: unknown;
  startTime: string | null;
  endTime: string | null;
  changedAt: string;
  changedBy: string | null;
}

export async function getAttributeHistory(
  attributeId: number,
  entityId: number
): Promise<AttributeHistoryRecord[]> {
  const rows = await query<{
    old_value: unknown;
    new_value: unknown;
    changed_by: string | null;
    changed_at: Date;
  }>(
    `SELECT old_value, new_value, changed_by, changed_at
       FROM var.attribute_change_log
      WHERE attribute_id = $1
        AND entity_id = $2
      ORDER BY changed_at DESC`,
    [attributeId, entityId]
  );

  return rows.map((row) => ({
    value: row.new_value,
    startTime: null,
    endTime: null,
    changedAt: row.changed_at.toISOString(),
    changedBy: row.changed_by
  }));
}

export interface EntityKindRecord {
  rowId: number;
  randId: string | null;
  kindName: string | null;
}

export async function listEntityKinds(): Promise<EntityKindRecord[]> {
  const rows = await query<{ row_id: number; rand_id: string | null; kind_name: string | null }>(
    `SELECT row_id, rand_id, kind_name FROM var.entity_kind ORDER BY kind_name`
  );
  return rows.map((row) => ({
    rowId: row.row_id,
    randId: row.rand_id,
    kindName: row.kind_name
  }));
}

export async function createEntityKind(input: EntityKindCreateInput): Promise<EntityKindRecord> {
  const rows = await query<{ row_id: number; rand_id: string | null; kind_name: string | null }>(
    `INSERT INTO var.entity_kind (rand_id, kind_name)
     VALUES ($1, $2)
     ON CONFLICT (kind_name) DO UPDATE SET kind_name = EXCLUDED.kind_name
     RETURNING row_id, rand_id, kind_name`,
    [randomUUID(), input.kindName]
  );
  const row = rows[0];
  if (!row) {
    throw new Error('Failed to create entity kind');
  }
  return {
    rowId: row.row_id,
    randId: row.rand_id,
    kindName: row.kind_name
  };
}

export async function updateEntityKind(rowId: number, input: EntityKindCreateInput): Promise<void> {
  await query(
    `UPDATE var.entity_kind
        SET kind_name = $2,
            up = now()
      WHERE row_id = $1`,
    [rowId, input.kindName]
  );
}

export async function deleteEntityKind(rowId: number): Promise<void> {
  await query(`DELETE FROM var.entity_kind WHERE row_id = $1`, [rowId]);
}

export interface EntityRecord {
  rowId: number;
  randId: string | null;
  kindId: number;
  name: string | null;
}

export async function listEntities(kindId?: number): Promise<EntityRecord[]> {
  const rows = await query<{ row_id: number; rand_id: string | null; kind_id: number; name: string | null }>(
    `SELECT row_id, rand_id, kind_id, name
       FROM var.entity
      WHERE $1::int IS NULL OR kind_id = $1
      ORDER BY name NULLS LAST`,
    [kindId ?? null]
  );
  return rows.map((row) => ({
    rowId: row.row_id,
    randId: row.rand_id,
    kindId: row.kind_id,
    name: row.name
  }));
}

export async function createEntity(input: EntityCreateInput): Promise<EntityRecord> {
  const rows = await query<{ row_id: number; rand_id: string | null; kind_id: number; name: string | null }>(
    `INSERT INTO var.entity (rand_id, kind_id, name)
     VALUES ($1, $2, $3)
     RETURNING row_id, rand_id, kind_id, name`,
    [randomUUID(), input.kindId, input.name]
  );
  const row = rows[0];
  if (!row) {
    throw new Error('Failed to create entity');
  }
  return {
    rowId: row.row_id,
    randId: row.rand_id,
    kindId: row.kind_id,
    name: row.name
  };
}

export interface AttributeOptionRecord {
  rowId: number;
  attributeId: number;
  value: string | null;
  randId: string | null;
}

export async function listAttributeOptions(attributeId: number): Promise<AttributeOptionRecord[]> {
  const rows = await query<{ row_id: number; attribute_id: number; value: string | null; rand_id: string | null }>(
    `SELECT row_id, attribute_id, value, rand_id
       FROM var.attribute_options
      WHERE attribute_id = $1
      ORDER BY row_id`,
    [attributeId]
  );
  return rows.map((row) => ({
    rowId: row.row_id,
    attributeId: row.attribute_id,
    value: row.value,
    randId: row.rand_id
  }));
}

export async function createAttributeOption(attributeId: number, value: string): Promise<AttributeOptionRecord> {
  const rows = await query<{ row_id: number; attribute_id: number; value: string | null; rand_id: string | null }>(
    `INSERT INTO var.attribute_options (rand_id, attribute_id, value)
     VALUES ($1, $2, $3)
     RETURNING row_id, attribute_id, value, rand_id`,
    [randomUUID(), attributeId, value]
  );
  const row = rows[0];
  if (!row) {
    throw new Error('Failed to create attribute option');
  }
  return {
    rowId: row.row_id,
    attributeId: row.attribute_id,
    value: row.value,
    randId: row.rand_id
  };
}

export async function updateAttributeOption(optionId: number, value: string): Promise<void> {
  await query(
    `UPDATE var.attribute_options
        SET value = $2
      WHERE row_id = $1`,
    [optionId, value]
  );
}

export async function deleteAttributeOption(optionId: number): Promise<void> {
  await query(`DELETE FROM var.attribute_options WHERE row_id = $1`, [optionId]);
}

export async function deleteAttribute(attributeId: number): Promise<void> {
  await query(`DELETE FROM var.attribute_def WHERE row_id = $1`, [attributeId]);
}

export async function updateEntity(rowId: number, input: EntityCreateInput): Promise<void> {
  await query(
    `UPDATE var.entity
        SET kind_id = $2,
            name = $3,
            up = now()
      WHERE row_id = $1`,
    [rowId, input.kindId, input.name]
  );
}

export async function deleteEntity(rowId: number): Promise<void> {
  await query(`DELETE FROM var.entity WHERE row_id = $1`, [rowId]);
}
