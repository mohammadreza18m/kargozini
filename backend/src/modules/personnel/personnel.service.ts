import { randomUUID } from 'crypto';
import type { PoolClient } from 'pg';
import { query } from '../../db/pool';
import { withTransaction } from '../../db/transaction';
import type { AttributeUpsertInput, PersonCreateInput, PersonVariableUpsertInput } from './personnel.schemas';

export interface PersonListItem {
  rowId: number;
  name: string | null;
  kindId: number;
  kindName: string | null;
}

export interface PersonDetail extends PersonListItem {
  attributes: Array<{
    attributeId: number;
    attributeName: string;
    displayName: string | null;
    category: string | null;
    dataType: string;
    value: unknown;
    defaultValue: unknown;
    validationRules: Record<string, unknown> | null;
    isVisible: boolean;
    isEditable: boolean;
    isSystem: boolean;
    dependsOnAttributeId: number | null;
    dependsOnValue: unknown;
    dependencies: Array<{
      dependsOnAttributeId: number;
      condition: Record<string, unknown> | null;
    }>;
    hidden: boolean;
    startTime: string | null;
    endTime: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
  }>;
}

export async function listEntityMembers(entityId: number): Promise<Array<{ rowId: number; randId: string | null }>> {
  const rows = await query<{ row_id: number; rand_id: string | null }>(
    `SELECT row_id, rand_id FROM var.entity_member WHERE entity_id = $1 ORDER BY row_id`,
    [entityId]
  );
  return rows.map((r) => ({ rowId: r.row_id, randId: r.rand_id }));
}

export async function addEntityMember(entityId: number): Promise<{ rowId: number; randId: string | null }> {
  const rows = await query<{ row_id: number; rand_id: string | null }>(
    `INSERT INTO var.entity_member (rand_id, entity_id)
     VALUES ($1, $2)
     RETURNING row_id, rand_id`,
    [randomUUID(), entityId]
  );
  const r = rows[0];
  return { rowId: r.row_id, randId: r.rand_id };
}

async function resolveKindId(client: PoolClient, input: PersonCreateInput): Promise<number> {
  if (input.kindId) return input.kindId;
  if (!input.kindName) {
    throw new Error('kindId or kindName must be provided');
  }

  const existing = await client.query<{ row_id: number }>(
    `SELECT row_id FROM var.entity_kind WHERE kind_name = $1`,
    [input.kindName]
  );
  if (existing.rowCount && existing.rows[0]) {
    return existing.rows[0].row_id;
  }

  const inserted = await client.query<{ row_id: number }>(
    `INSERT INTO var.entity_kind (rand_id, kind_name) VALUES ($1, $2) RETURNING row_id`,
    [randomUUID(), input.kindName]
  );
  return inserted.rows[0].row_id;
}

export async function createPerson(input: PersonCreateInput): Promise<PersonDetail> {
  return withTransaction(async (client) => {
    const kindId = await resolveKindId(client, input);
    const person = await client.query<{
      row_id: number;
      rand_id: string;
      name: string | null;
    }>(
      `INSERT INTO var.entity (rand_id, kind_id, name)
       VALUES ($1, $2, $3)
       RETURNING row_id, rand_id, name`,
      [randomUUID(), kindId, input.name]
    );

    // Create entity_member row linked to this entity
    await client.query(
      `INSERT INTO var.entity_member (rand_id, entity_id)
       VALUES ($1, $2)
       ON CONFLICT (entity_id) DO NOTHING`,
      [person.rows[0].rand_id, person.rows[0].row_id]
    );

    return {
      rowId: person.rows[0].row_id,
      name: person.rows[0].name,
      kindId,
      kindName: input.kindName ?? null,
      attributes: []
    };
  });
}

export async function listPersonnel(): Promise<PersonListItem[]> {
  const rows = await query<{
    row_id: number;
    name: string | null;
    kind_id: number;
    kind_name: string | null;
  }>(
    `SELECT e.row_id, e.name, e.kind_id, k.kind_name
       FROM var.entity e
  LEFT JOIN var.entity_kind k ON e.kind_id = k.row_id
      ORDER BY e.row_id DESC
      LIMIT 200`
  );

  return rows.map((row) => ({
    rowId: row.row_id,
    name: row.name,
    kindId: row.kind_id,
    kindName: row.kind_name
  }));
}

export async function getPerson(rowId: number, opts?: { memberRowId?: number | null }): Promise<PersonDetail | null> {
  const people = await query<{
    row_id: number;
    name: string | null;
    kind_id: number;
    kind_name: string | null;
  }>(
    `SELECT e.row_id, e.name, e.kind_id, k.kind_name
       FROM var.entity e
  LEFT JOIN var.entity_kind k ON e.kind_id = k.row_id
      WHERE e.row_id = $1`,
    [rowId]
  );

  if (people.length === 0) return null;
  const person = people[0];

  const attrs = await query<{
    attribute_id: number;
    attribute_name: string;
    display_name: string | null;
    category: string | null;
    data_type: string;
    default_value: unknown;
    validation_rules: Record<string, unknown> | null;
    is_visible: boolean;
    is_editable: boolean;
    is_system: boolean;
    depends_on_attribute_id: number | null;
    depends_on_value: unknown;
    value_string: string | null;
    value_real: number | null;
    value_date: Date | null;
    value_bool: boolean | null;
    value_json: unknown;
    start_time: Date | null;
    end_time: Date | null;
    updated_at: Date | null;
    updated_by: string | null;
  }>(
    `SELECT a.row_id AS attribute_id,
            a.attribute_name,
            a.display_name,
            a.category,
            a.data_type,
            a.default_value,
            a.validation_rules,
            COALESCE(a.is_visible, TRUE) AS is_visible,
            COALESCE(a.is_editable, TRUE) AS is_editable,
            COALESCE(a.is_system, FALSE) AS is_system,
            a.depends_on_attribute_id,
            a.depends_on_value,
            v.value_string,
            v.value_real,
            v.value_date,
            v.value_bool,
            v.value_json,
            v.start_time,
            v.end_time,
            v.updated_at,
            v.updated_by
       FROM var.attribute_def a
  LEFT JOIN var.eav v
         ON v.attribute_id = a.row_id
        AND v.entity_id = $1
        AND ($3::int IS NULL OR v.member_row_id = $3)
      WHERE a.kind_id = $2
      ORDER BY a.category NULLS LAST, a.display_name NULLS LAST, a.attribute_name`,
    [rowId, person.kind_id, opts?.memberRowId ?? null]
  );

  const attributeIds = attrs.map((attr) => attr.attribute_id);
  const dependencyRows = attributeIds.length
    ? await query<{
        attribute_id: number;
        depends_on_attribute_id: number;
        condition: Record<string, unknown> | null;
      }>(
        `SELECT attribute_id, depends_on_attribute_id, condition
           FROM var.attribute_dependencies
          WHERE attribute_id = ANY($1::int[])`,
        [attributeIds]
      )
    : [];

  const dependencyMap = new Map<number, Array<{ dependsOnAttributeId: number; condition: Record<string, unknown> | null }>>();
  for (const dep of dependencyRows) {
    const list = dependencyMap.get(dep.attribute_id) ?? [];
    list.push({ dependsOnAttributeId: dep.depends_on_attribute_id, condition: dep.condition ?? null });
    dependencyMap.set(dep.attribute_id, list);
  }

  const valueMap = new Map<number, unknown>();

  function convertValue(attr: (typeof attrs)[number]): unknown {
    switch (attr.data_type) {
      case 'real':
        return attr.value_real ?? attr.default_value ?? null;
      case 'date':
        return attr.value_date?.toISOString().slice(0, 10) ?? attr.default_value ?? null;
      case 'bool':
        return attr.value_bool ?? attr.default_value ?? null;
      case 'json':
        return attr.value_json ?? attr.default_value ?? null;
      default:
        return attr.value_string ?? attr.default_value ?? null;
    }
  }

  function dependencySatisfied(attributeId: number): boolean {
    const deps = dependencyMap.get(attributeId);
    if (!deps || deps.length === 0) return true;
    return deps.every((dep) => {
      const value = valueMap.get(dep.dependsOnAttributeId);
      if (value === undefined || value === null) return false;
      if (!dep.condition) return true;
      if (dep.condition.equals !== undefined) {
        return value === dep.condition.equals;
      }
      if (Array.isArray(dep.condition.in)) {
        return (dep.condition.in as unknown[]).includes(value as never);
      }
      if (dep.condition.notEquals !== undefined) {
        return value !== dep.condition.notEquals;
      }
      return true;
    });
  }

  for (const attr of attrs) {
    valueMap.set(attr.attribute_id, convertValue(attr));
  }

  return {
    rowId: person.row_id,
    name: person.name,
    kindId: person.kind_id,
    kindName: person.kind_name,
    attributes: attrs.map((attr) => {
      const dependencies = dependencyMap.get(attr.attribute_id) ?? [];
      const value = valueMap.get(attr.attribute_id);
      const hidden = !attr.is_visible || !dependencySatisfied(attr.attribute_id);

      return {
        attributeId: attr.attribute_id,
        attributeName: attr.attribute_name,
        displayName: attr.display_name,
        category: attr.category,
        dataType: attr.data_type,
        value,
        defaultValue: attr.default_value,
        validationRules: attr.validation_rules,
        isVisible: attr.is_visible,
        isEditable: attr.is_editable,
        isSystem: attr.is_system,
        dependsOnAttributeId: attr.depends_on_attribute_id,
        dependsOnValue: attr.depends_on_value,
        dependencies,
        hidden,
        startTime: attr.start_time?.toISOString() ?? null,
        endTime: attr.end_time?.toISOString() ?? null,
        updatedAt: attr.updated_at?.toISOString() ?? null,
        updatedBy: attr.updated_by
      };
    })
  };
}

export async function upsertPersonAttribute(
  personId: number,
  input: AttributeUpsertInput
): Promise<void> {
  await withTransaction(async (client) => {
    const attrDef = await client.query<{
      row_id: number;
      data_type: string;
      is_editable: boolean;
      validation_rules: Record<string, unknown> | null;
      default_value: unknown;
      depends_on_attribute_id: number | null;
      depends_on_value: unknown;
    }>(
      `SELECT row_id, data_type, COALESCE(is_editable, TRUE) AS is_editable,
              validation_rules, default_value, depends_on_attribute_id, depends_on_value
         FROM var.attribute_def
        WHERE row_id = $1`,
      [input.attributeId]
    );

    if (attrDef.rowCount === 0) {
      throw Object.assign(new Error('Attribute not found'), { status: 404 });
    }

    const dataType = attrDef.rows[0].data_type;
    if (!attrDef.rows[0].is_editable) {
      throw Object.assign(new Error('Attribute is read-only'), { status: 403 });
    }

    const dependencies = await client.query<{
      depends_on_attribute_id: number;
      condition: Record<string, unknown> | null;
    }>(
      `SELECT depends_on_attribute_id, condition
         FROM var.attribute_dependencies
        WHERE attribute_id = $1`,
      [input.attributeId]
    );

    const dependencyValues = dependencies.rows.length
      ? await client.query<{
          attribute_id: number;
          value_string: string | null;
          value_real: number | null;
          value_date: Date | null;
          value_bool: boolean | null;
          value_json: unknown;
        }>(
          `SELECT e.attribute_id,
                  e.value_string,
                  e.value_real,
                  e.value_date,
                  e.value_bool,
                  e.value_json
             FROM var.eav e
            WHERE e.entity_id = $1
              AND e.attribute_id = ANY($2::int[])`,
          [personId, dependencies.rows.map((d) => d.depends_on_attribute_id)]
        )
      : { rows: [] } as { rows: Array<{ attribute_id: number; value_string: string | null; value_real: number | null; value_date: Date | null; value_bool: boolean | null; value_json: unknown }> };

    const dependencyMap = new Map<number, unknown>();
    for (const row of dependencyValues.rows) {
      const value = row.value_json ?? row.value_real ?? row.value_bool ?? row.value_string;
      const finalValue =
        row.value_date ? row.value_date.toISOString().slice(0, 10) : value;
      dependencyMap.set(row.attribute_id, finalValue);
    }

    const dependencySatisfied = dependencies.rows.every((dep) => {
      const value = dependencyMap.get(dep.depends_on_attribute_id);
      if (value === undefined || value === null) return false;
      if (!dep.condition) return true;
      if (dep.condition.equals !== undefined) {
        return value === dep.condition.equals;
      }
      if (Array.isArray(dep.condition.in)) {
        return (dep.condition.in as unknown[]).includes(value as never);
      }
      if (dep.condition.notEquals !== undefined) {
        return value !== dep.condition.notEquals;
      }
      return true;
    });

    if (!dependencySatisfied) {
      throw Object.assign(new Error('Dependency condition not satisfied for attribute'), {
        status: 400
      });
    }

    const validation = (attrDef.rows[0].validation_rules ?? {}) as Record<string, unknown>;
    const required = Boolean(validation.required);
    const minValue = typeof validation.min === 'number' ? (validation.min as number) : undefined;
    const maxValue = typeof validation.max === 'number' ? (validation.max as number) : undefined;
    const patternValue = typeof validation.pattern === 'string' ? (validation.pattern as string) : undefined;
    const optionsValue = Array.isArray(validation.options)
      ? (validation.options as unknown[])
      : undefined;

    const normalizedValue = (() => {
      switch (dataType) {
        case 'string':
          return input.valueString ?? attrDef.rows[0].default_value ?? null;
        case 'real':
          return input.valueReal ?? attrDef.rows[0].default_value ?? null;
        case 'date':
          return input.valueDate ?? attrDef.rows[0].default_value ?? null;
        case 'bool':
          return input.valueBool ?? attrDef.rows[0].default_value ?? null;
        case 'json':
          return input.valueJson ?? attrDef.rows[0].default_value ?? null;
        default:
          throw new Error(`Unsupported data type ${dataType}`);
      }
    })();

    if (required && (normalizedValue === null || normalizedValue === undefined)) {
      throw Object.assign(new Error('Attribute value is required'), { status: 400 });
    }

    if (normalizedValue !== null && normalizedValue !== undefined) {
      if (dataType === 'real') {
        if (minValue !== undefined && typeof normalizedValue === 'number' && normalizedValue < minValue) {
          throw Object.assign(new Error('Value below minimum'), { status: 400 });
        }
        if (maxValue !== undefined && typeof normalizedValue === 'number' && normalizedValue > maxValue) {
          throw Object.assign(new Error('Value above maximum'), { status: 400 });
        }
      }
      if (dataType === 'string' && patternValue) {
        const regex = new RegExp(patternValue);
        if (!regex.test(String(normalizedValue))) {
          throw Object.assign(new Error('Value does not match required pattern'), { status: 400 });
        }
      }
      if (optionsValue) {
        const normStr = String(normalizedValue);
        const optStrs = optionsValue.map((v) => String(v));
        if (!optStrs.includes(normStr)) {
          throw Object.assign(new Error('Value is not in allowed options'), { status: 400 });
        }
      }
    }
    const existing = await client.query<{
      value_string: string | null;
      value_real: number | null;
      value_date: Date | null;
      value_bool: boolean | null;
      value_json: unknown;
    }>(
      `SELECT value_string, value_real, value_date, value_bool, value_json
         FROM var.eav
        WHERE entity_id = $1 AND attribute_id = $2 AND COALESCE(member_row_id, 0) = COALESCE($3, 0)`,
      [personId, input.attributeId, input.memberRowId ?? null]
    );

    const oldValue = existing.rowCount
      ? existing.rows[0].value_json ??
        existing.rows[0].value_real ??
        existing.rows[0].value_bool ??
        (existing.rows[0].value_date
          ? existing.rows[0].value_date.toISOString().slice(0, 10)
          : existing.rows[0].value_string)
      : null;

    const newColumns = {
      value_string: null as string | null,
      value_real: null as number | null,
      value_date: null as Date | null,
      value_bool: null as boolean | null,
      value_json: null as unknown
    };

    switch (dataType) {
      case 'string':
        newColumns.value_string = normalizedValue as string | null;
        break;
      case 'real':
        newColumns.value_real = normalizedValue as number | null;
        break;
      case 'date':
        newColumns.value_date = normalizedValue ? new Date(String(normalizedValue)) : null;
        break;
      case 'bool':
        newColumns.value_bool = normalizedValue as boolean | null;
        break;
      case 'json':
        newColumns.value_json = normalizedValue;
        break;
      default:
        throw new Error(`Unsupported data type ${dataType}`);
    }

    const updatedBy = input.updatedBy ?? 'system';
    const startTime = input.startTime ? new Date(input.startTime) : null;
    const endTime = input.endTime ? new Date(input.endTime) : null;

    // Resolve member_row_id for this person: use provided or default (first)
    let memberRowId = input.memberRowId ?? null;
    if (!memberRowId) {
      const mem = await client.query<{ row_id: number }>(
        `SELECT row_id FROM var.entity_member WHERE entity_id = $1 ORDER BY row_id LIMIT 1`,
        [personId]
      );
      memberRowId = mem.rows[0]?.row_id ?? null;
    }

    // Since ON CONFLICT cannot target partial index reliably, do delete+insert for exact member scope
    await client.query(
      `DELETE FROM var.eav WHERE entity_id = $1 AND attribute_id = $2 AND COALESCE(member_row_id, 0) = COALESCE($3, 0)`,
      [personId, input.attributeId, memberRowId]
    );
    await client.query(
      `INSERT INTO var.eav
         (rand_id, entity_id, member_row_id, attribute_id, value_string, value_real, value_date, value_bool, value_json,
          option_row_id, start_time, end_time, created_by, updated_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13, $13, now(), now())`,
      [
        randomUUID(),
        personId,
        memberRowId,
        input.attributeId,
        newColumns.value_string,
        newColumns.value_real,
        newColumns.value_date,
        newColumns.value_bool,
        newColumns.value_json,
        input.optionRowId ?? null,
        startTime,
        endTime,
        updatedBy
      ]
    );

    const oldJson = oldValue === undefined ? null : JSON.stringify(oldValue);
    const newJson = normalizedValue === undefined ? null : JSON.stringify(normalizedValue);

    if (oldJson !== newJson) {
      await client.query(
        `INSERT INTO var.attribute_change_log
           (attribute_id, entity_id, old_value, new_value, changed_by)
         VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)`,
        [input.attributeId, personId, oldJson, newJson, updatedBy]
      );
    }
  });
}

export async function calcHokmItems(personId: number, year: number): Promise<Array<{ itemName: string; itemRandId: string; points: number | null; amountRial: number | null }>> {
  // resolve person's rand_id
  const ent = await query<{ rand_id: string }>(`SELECT rand_id FROM var.entity WHERE row_id = $1`, [personId]);
  if (ent.length === 0) {
    throw Object.assign(new Error('Person not found'), { status: 404 });
  }
  const prRandId = ent[0].rand_id;
  const rows = await query<{ item_name: string; item_rand_id: string; points: string | null; amount_rial: string | null }>(
    `SELECT item_name, item_rand_id, points, amount_rial FROM var.fn_calc_hokm_items($1, $2)`,
    [prRandId, year]
  );
  return rows.map((r) => ({
    itemName: r.item_name,
    itemRandId: r.item_rand_id,
    points: r.points != null ? Number(r.points) : null,
    amountRial: r.amount_rial != null ? Number(r.amount_rial) : null
  }));
}

export async function upsertPersonVariableValue(personId: number, input: PersonVariableUpsertInput): Promise<void> {
  await withTransaction(async (client) => {
    const ent = await client.query<{ rand_id: string }>(
      `SELECT rand_id FROM var.entity WHERE row_id = $1`,
      [personId]
    );
    if (ent.rowCount === 0) {
      throw Object.assign(new Error('Person not found'), { status: 404 });
    }

    // validate option belongs to variable
    const opt = await client.query<{ variable_row_id: number }>(
      `SELECT variable_row_id FROM var.order_variables_options WHERE row_id = $1`,
      [input.optionRowId]
    );
    if (opt.rowCount === 0) {
      throw Object.assign(new Error('Variable option not found'), { status: 400 });
    }
    if (opt.rows[0].variable_row_id !== input.variableRowId) {
      throw Object.assign(new Error('Option does not belong to the specified variable'), { status: 400 });
    }

    // get variable rand_id for traceability
    const varRow = await client.query<{ rand_id: string | null }>(
      `SELECT rand_id FROM var.order_variables WHERE row_id = $1`,
      [input.variableRowId]
    );
    const variableRandId = varRow.rows[0]?.rand_id ?? String(input.variableRowId);

    const prRandId = ent.rows[0].rand_id;

    // ensure one active row per person+variable: delete existing then insert
    await client.query(
      `DELETE FROM var.person_variable_values
        WHERE pr_rand_id = $1 AND variable_row_id = $2`,
      [prRandId, input.variableRowId]
    );

    await client.query(
      `INSERT INTO var.person_variable_values
         (rand_id, variable_row_id, variable_rand_id, pr_rand_id, start_time, end_time, option_row_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1)`,
      [
        randomUUID(),
        input.variableRowId,
        variableRandId,
        prRandId,
        input.startTime ? new Date(input.startTime) : null,
        input.endTime ? new Date(input.endTime) : null,
        input.optionRowId
      ]
    );
  });
}
