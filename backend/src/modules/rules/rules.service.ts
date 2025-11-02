import { randomUUID } from 'crypto';
import type { PoolClient } from 'pg';
import { query } from '../../db/pool';
import { withTransaction } from '../../db/transaction';
import type {
  AuthInput,
  AuthItemsInput,
  AuthUpdateInput,
  HokmTypeInput,
  HokmTypeItemsInput,
  HokmYearInput,
  ItemInput,
  ItemUpdateInput,
  ItemsRatioInput,
  ItemVariablesRatioInput,
  ItemScoresRatioInput,
  ScoreFactsUpsertInput,
  ScoreInput,
  ScoreOptionsUpsertInput,
  ScoreUpdateInput,
  ScoreVariablesInput,
  SimulationInput,
  VariableFactsInput,
  VariableInput,
  VariableOptionsUpsertInput,
  VariableUpdateInput
} from './rules.schemas';

const VARIABLE_VOP_MAP = {
  value: 1,
  percent: 2
} as const;

const VARIABLE_VOP_REVERSE = new Map<number, keyof typeof VARIABLE_VOP_MAP>(
  Object.entries(VARIABLE_VOP_MAP).map(([key, value]) => [value, key as keyof typeof VARIABLE_VOP_MAP])
);

const SOM_MAP = {
  condition: 1,
  combination: 2
} as const;

const SOM_REVERSE = new Map<number, keyof typeof SOM_MAP>(
  Object.entries(SOM_MAP).map(([key, value]) => [value, key as keyof typeof SOM_MAP])
);

const SCORE_VOP_MAP = {
  value: 1,
  percent: 2
} as const;

const SCORE_VOP_REVERSE = new Map<number, keyof typeof SCORE_VOP_MAP>(
  Object.entries(SCORE_VOP_MAP).map(([key, value]) => [value, key as keyof typeof SCORE_VOP_MAP])
);

export interface VariableRecord {
  rowId: number;
  randId: string;
  name: string | null;
  description: string | null;
  variableVop: keyof typeof VARIABLE_VOP_MAP | null;
  som: keyof typeof SOM_MAP | null;
  valueMin: number | null;
  valueMax: number | null;
  valueDefault: number | null;
  startTime: string | null;
  endTime: string | null;
}

export interface ScoreRecord {
  rowId: number;
  randId: string;
  name: string | null;
  description: string | null;
  category?: string | null;
  ruleSetRowId?: number | null;
  condition?: string | null;
  status?: number | null;
  scoreVopSom: keyof typeof SCORE_VOP_MAP | null;
  som: keyof typeof SOM_MAP | null;
  valueMin: number | null;
  valueMax: number | null;
  valueDefault: number | null;
  formula: string | null;
  startTime: string | null;
  endTime: string | null;
  variables: Array<{ id: number; name: string | null }>;
}

export async function listVariables(): Promise<VariableRecord[]> {
  const rows = await query<{
    row_id: number;
    rand_id: string;
    name: string | null;
    description: string | null;
    variable_vop: number | null;
    som: number | null;
    value_min: number | null;
    value_max: number | null;
    value_default: number | null;
    start_time: Date | null;
    end_time: Date | null;
  }>(
    `SELECT row_id, rand_id, name, description, variable_vop, som,
            value_min, value_max, value_default, start_time, end_time
       FROM var.order_variables
      ORDER BY name NULLS LAST`
  );

  return rows.map((row) => ({
    rowId: row.row_id,
    randId: row.rand_id,
    name: row.name,
    description: row.description,
    variableVop: row.variable_vop ? VARIABLE_VOP_REVERSE.get(row.variable_vop) ?? null : null,
    som: row.som ? SOM_REVERSE.get(row.som) ?? null : null,
    valueMin: row.value_min,
    valueMax: row.value_max,
    valueDefault: row.value_default,
    startTime: row.start_time?.toISOString() ?? null,
    endTime: row.end_time?.toISOString() ?? null
  }));
}

export async function createVariable(input: VariableInput): Promise<VariableRecord> {
  return withTransaction(async (client) => {
    const result = await client.query<{
      row_id: number;
      rand_id: string;
      name: string | null;
      description: string | null;
      variable_vop: number | null;
      som: number | null;
      value_min: number | null;
      value_max: number | null;
      value_default: number | null;
      start_time: Date | null;
      end_time: Date | null;
    }>(
      `INSERT INTO var.order_variables
        (rand_id, name, description, variable_vop, value_min, value_max, value_default, start_time, end_time, som)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING row_id, rand_id, name, description, variable_vop, som, value_min, value_max, value_default, start_time, end_time`,
      [
        randomUUID(),
        input.name,
        input.description ?? null,
        VARIABLE_VOP_MAP[input.variableVop],
        input.valueMin ?? null,
        input.valueMax ?? null,
        input.valueDefault ?? null,
        input.startTime ? new Date(input.startTime) : null,
        input.endTime ? new Date(input.endTime) : null,
        SOM_MAP[input.som]
      ]
    );

    const row = result.rows[0];
    return {
      rowId: row.row_id,
      randId: row.rand_id,
      name: row.name,
      description: row.description,
      variableVop: row.variable_vop ? VARIABLE_VOP_REVERSE.get(row.variable_vop) ?? null : null,
      som: row.som ? SOM_REVERSE.get(row.som) ?? null : null,
      valueMin: row.value_min,
      valueMax: row.value_max,
      valueDefault: row.value_default,
      startTime: row.start_time?.toISOString() ?? null,
      endTime: row.end_time?.toISOString() ?? null
    };
  });
}

export async function updateVariable(rowId: number, input: VariableUpdateInput): Promise<void> {
  await query(
    `UPDATE var.order_variables
        SET name = COALESCE($2, name),
            description = COALESCE($3, description),
            variable_vop = COALESCE($4, variable_vop),
            value_min = COALESCE($5, value_min),
            value_max = COALESCE($6, value_max),
            value_default = COALESCE($7, value_default),
            start_time = COALESCE($8, start_time),
            end_time = COALESCE($9, end_time),
            som = COALESCE($10, som),
            up = now()
      WHERE row_id = $1`,
    [
      rowId,
      input.name ?? null,
      input.description ?? null,
      input.variableVop ? VARIABLE_VOP_MAP[input.variableVop] : null,
      input.valueMin ?? null,
      input.valueMax ?? null,
      input.valueDefault ?? null,
      input.startTime ? new Date(input.startTime) : null,
      input.endTime ? new Date(input.endTime) : null,
      input.som ? SOM_MAP[input.som] : null
    ]
  );
}

export async function deleteVariable(rowId: number): Promise<void> {
  // Application-level cascade as a fallback when DB FK is not ON DELETE CASCADE
  await withTransaction(async (client: PoolClient) => {
    await client.query('DELETE FROM var.order_variable_fact WHERE variable_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.order_variables_options WHERE variable_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.order_score_variables WHERE variable_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.order_items_variable_ratio WHERE variable_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.person_variable_values WHERE variable_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.order_variables WHERE row_id = $1', [rowId]);
  });
}

export async function getVariableFacts(variableRowId: number): Promise<number[]> {
  const rows = await query<{ fact_row_id: number }>(
    `SELECT fact_row_id FROM var.order_variable_fact WHERE variable_row_id = $1`,
    [variableRowId]
  );
  return rows.map((r) => r.fact_row_id);
}

export async function setVariableFacts(variableRowId: number, input: VariableFactsInput): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM var.order_variable_fact WHERE variable_row_id = $1', [variableRowId]);
    for (const factId of input.factIds) {
      await client.query(
        `INSERT INTO var.order_variable_fact (rand_id, variable_row_id, fact_row_id)
         VALUES ($1, $2, $3)`,
        [randomUUID(), variableRowId, factId]
      );
    }
  });
}

export interface VariableOptionRecord {
  rowId: number;
  composition: string | null;
  value: string | null;
}

export async function listVariableOptions(variableRowId: number): Promise<VariableOptionRecord[]> {
  const rows = await query<{ row_id: number; composition: string | null; value: string | null }>(
    `SELECT row_id, composition, value
       FROM var.order_variables_options
      WHERE variable_row_id = $1
      ORDER BY row_id`,
    [variableRowId]
  );
  return rows.map((r) => ({ rowId: r.row_id, composition: r.composition, value: r.value }));
}

export async function replaceVariableOptions(
  variableRowId: number,
  input: VariableOptionsUpsertInput
): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM var.order_variables_options WHERE variable_row_id = $1', [variableRowId]);
    for (const row of input.rows) {
      let composition = row.composition;
      if (composition && composition.trim().startsWith('{')) {
        try {
          const obj = JSON.parse(composition) as Record<string, unknown>;
          const parts: string[] = [];
          for (const [key, val] of Object.entries(obj)) {
            parts.push(`${Number(key)}:${String(val ?? '')}`);
          }
          composition = parts.join(',');
        } catch {
          // keep original if parsing fails
        }
      }
      await client.query(
        `INSERT INTO var.order_variables_options (rand_id, variable_row_id, variable_rand_id, composition, value)
         VALUES ($1, $2, $3, $4, $5)`,
        [randomUUID(), variableRowId, String(variableRowId), composition, row.value]
      );
    }
  });
}

export async function listScores(): Promise<ScoreRecord[]> {
  const scoreRows = await query<{
    row_id: number;
    rand_id: string;
    name: string | null;
    description: string | null;
    category: string | null;
    rule_set_row_id: number | null;
    condition: string | null;
    score_vop_som: number | null;
    som: number | null;
    value_min: number | null;
    value_max: number | null;
    value_default: number | null;
    formula: string | null;
    start_time: Date | null;
    end_time: Date | null;
    status: number | null;
  }>(
    `SELECT row_id, rand_id, name, description, category, rule_set_row_id, condition,
            score_vop_som, som, value_min, value_max, value_default, formula, start_time, end_time, status
       FROM var.order_scores
      ORDER BY name NULLS LAST`
  );

  const scoreIds = scoreRows.map((row) => row.row_id);
  const variableLinks =
    scoreIds.length > 0
      ? await query<{
          score_row_id: number;
          variable_row_id: number;
          variable_name: string | null;
        }>(
          `SELECT osv.score_row_id,
                  osv.variable_row_id,
                  ov.name AS variable_name
             FROM var.order_score_variables osv
        LEFT JOIN var.order_variables ov
               ON ov.row_id = osv.variable_row_id
            WHERE osv.score_row_id = ANY($1::int[])`,
          [scoreIds]
        )
      : [];

  return scoreRows.map((row) => ({
    rowId: row.row_id,
    randId: row.rand_id,
    name: row.name,
    description: row.description,
    category: row.category,
    ruleSetRowId: row.rule_set_row_id,
    condition: row.condition,
    scoreVopSom: row.score_vop_som
      ? SCORE_VOP_REVERSE.get(row.score_vop_som) ?? null
      : null,
    som: row.som ? SOM_REVERSE.get(row.som) ?? null : null,
    valueMin: row.value_min,
    valueMax: row.value_max,
    valueDefault: row.value_default,
    formula: row.formula,
    startTime: row.start_time?.toISOString() ?? null,
    endTime: row.end_time?.toISOString() ?? null,
    status: row.status,
    variables: variableLinks
      .filter((link) => link.score_row_id === row.row_id)
      .map((link) => ({
        id: link.variable_row_id,
        name: link.variable_name
      }))
  }));
}

export async function createScore(input: ScoreInput): Promise<ScoreRecord> {
  return withTransaction(async (client) => {
    const insertScore = await client.query<{
      row_id: number;
      rand_id: string;
      name: string | null;
      description: string | null;
      category: string | null;
      rule_set_row_id: number | null;
      condition: string | null;
      score_vop_som: number | null;
      som: number | null;
      value_min: number | null;
      value_max: number | null;
      value_default: number | null;
      formula: string | null;
      start_time: Date | null;
      end_time: Date | null;
    }>(
      `INSERT INTO var.order_scores
        (rand_id, name, description, category, rule_set_row_id, condition, formula, score_vop_som, som, value_min, value_max, value_default, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 2)
       RETURNING row_id, rand_id, name, description, category, rule_set_row_id, condition, formula, score_vop_som, som,
                 value_min, value_max, value_default, start_time, end_time`,
      [
        randomUUID(),
        input.name,
        input.description ?? null,
        input.category ?? null,
        input.ruleSetRowId ?? null,
        input.condition ?? null,
        input.formula,
        SCORE_VOP_MAP[input.scoreVopSom],
        SOM_MAP[input.som],
        input.valueMin ?? null,
        input.valueMax ?? null,
        input.valueDefault ?? null,
        input.startTime ? new Date(input.startTime) : null,
        input.endTime ? new Date(input.endTime) : null
      ]
    );

    const scoreRow = insertScore.rows[0];

    for (const variableId of input.variableIds) {
      await client.query(
        `INSERT INTO var.order_score_variables
           (score_row_id, variable_row_id, rand_id, score_rand_id, variable_rand_id, status)
         VALUES ($1, $2, $3, $4, $5, 1)`,
        [
          scoreRow.row_id,
          variableId,
          randomUUID(),
          scoreRow.rand_id,
          String(variableId)
        ]
      );
    }

    const variableMeta =
      input.variableIds.length > 0
        ? await client.query<{ row_id: number; name: string | null }>(
            `SELECT row_id, name
               FROM var.order_variables
              WHERE row_id = ANY($1::int[])`,
            [input.variableIds]
          )
        : { rows: [] };

    return {
      rowId: scoreRow.row_id,
      randId: scoreRow.rand_id,
      name: scoreRow.name,
      description: scoreRow.description,
      category: scoreRow.category,
      ruleSetRowId: scoreRow.rule_set_row_id,
      condition: scoreRow.condition,
      scoreVopSom: scoreRow.score_vop_som
        ? SCORE_VOP_REVERSE.get(scoreRow.score_vop_som) ?? null
        : null,
      som: scoreRow.som ? SOM_REVERSE.get(scoreRow.som) ?? null : null,
      valueMin: scoreRow.value_min,
      valueMax: scoreRow.value_max,
      valueDefault: scoreRow.value_default,
      formula: scoreRow.formula,
      startTime: scoreRow.start_time?.toISOString() ?? null,
      endTime: scoreRow.end_time?.toISOString() ?? null,
      status: 2,
      variables: input.variableIds.map((id) => ({
        id,
        name: variableMeta.rows.find((row) => row.row_id === id)?.name ?? null
      }))
    };
  });
}

export async function updateScore(rowId: number, input: ScoreUpdateInput): Promise<void> {
  await query(
    `UPDATE var.order_scores
        SET name = COALESCE($2, name),
            description = COALESCE($3, description),
            category = COALESCE($4, category),
            rule_set_row_id = COALESCE($5, rule_set_row_id),
            condition = COALESCE($6, condition),
            score_vop_som = COALESCE($7, score_vop_som),
            som = COALESCE($8, som),
            value_min = COALESCE($9, value_min),
            value_max = COALESCE($10, value_max),
            value_default = COALESCE($11, value_default),
            start_time = COALESCE($12, start_time),
            end_time = COALESCE($13, end_time),
            up = now()
      WHERE row_id = $1`,
    [
      rowId,
      input.name ?? null,
      input.description ?? null,
      input.category ?? null,
      input.ruleSetRowId ?? null,
      input.condition ?? null,
      input.scoreVopSom ? SCORE_VOP_MAP[input.scoreVopSom] : null,
      input.som ? SOM_MAP[input.som] : null,
      input.valueMin ?? null,
      input.valueMax ?? null,
      input.valueDefault ?? null,
      input.startTime ? new Date(input.startTime) : null,
      input.endTime ? new Date(input.endTime) : null
    ]
  );
}

export async function deleteScore(rowId: number): Promise<void> {
  // Application-level cascade for legacy DBs without FK cascades
  await withTransaction(async (client: PoolClient) => {
    await client.query('DELETE FROM var.order_score_variables WHERE score_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.order_score_options WHERE score_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.order_score_fact WHERE score_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.order_items_score_ratio WHERE score_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.matrix_person_score_values WHERE score_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.order_scores WHERE row_id = $1', [rowId]);
  });
}

export async function getScoreVariables(scoreRowId: number): Promise<number[]> {
  const rows = await query<{ variable_row_id: number }>(
    `SELECT variable_row_id FROM var.order_score_variables WHERE score_row_id = $1`,
    [scoreRowId]
  );
  return rows.map((r) => r.variable_row_id);
}

export async function setScoreVariables(scoreRowId: number, input: ScoreVariablesInput): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM var.order_score_variables WHERE score_row_id = $1', [scoreRowId]);
    for (const variableId of input.variableIds) {
      await client.query(
        `INSERT INTO var.order_score_variables (rand_id, score_row_id, variable_row_id, score_rand_id, variable_rand_id, status)
         VALUES ($1, $2, $3, $4, $5, 1)`,
        [randomUUID(), scoreRowId, variableId, String(scoreRowId), String(variableId)]
      );
    }
  });
}

export interface ScoreOptionRecord { rowId: number; composition: string | null; value: number | null }
export async function listScoreOptions(scoreRowId: number): Promise<ScoreOptionRecord[]> {
  const rows = await query<{ row_id: number; composition: string | null; value: number | null }>(
    `SELECT row_id, composition, value FROM var.order_score_options WHERE score_row_id = $1 ORDER BY row_id`,
    [scoreRowId]
  );
  return rows.map((r) => ({ rowId: r.row_id, composition: r.composition, value: r.value }));
}

export async function replaceScoreOptions(scoreRowId: number, input: ScoreOptionsUpsertInput): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM var.order_score_options WHERE score_row_id = $1', [scoreRowId]);
    for (const row of input.rows) {
      let composition = row.composition;
      if (composition && composition.trim().startsWith('{')) {
        try {
          const obj = JSON.parse(composition) as Record<string, { min?: unknown; max?: unknown }>;
          const parts: string[] = [];
          for (const [key, range] of Object.entries(obj)) {
            const min = (range?.min ?? '') as any;
            const max = (range?.max ?? '') as any;
            parts.push(`${Number(key)}:${String(min)}||${String(max)}`);
          }
          composition = parts.join(',');
        } catch {
          // keep original if parsing fails
        }
      }
      await client.query(
        `INSERT INTO var.order_score_options (rand_id, score_row_id, score_rand_id, composition, value)
         VALUES ($1, $2, $3, $4, $5)`,
        [randomUUID(), scoreRowId, String(scoreRowId), composition, row.value]
      );
    }
  });
}

export interface ScoreFactRecord { rowId: number; factRowId: number | null; name: string | null; description: string | null; ord: number | null }
export async function listScoreFacts(scoreRowId: number): Promise<ScoreFactRecord[]> {
  const rows = await query<{
    row_id: number;
    fact_row_id: number | null;
    name: string | null;
    description: string | null;
    ord: number | null;
  }>(
    `SELECT row_id, fact_row_id, name, description, ord FROM var.order_score_fact WHERE score_row_id = $1 ORDER BY ord NULLS LAST, row_id`,
    [scoreRowId]
  );
  return rows.map((r) => ({ rowId: r.row_id, factRowId: r.fact_row_id, name: r.name, description: r.description, ord: r.ord }));
}

export async function replaceScoreFacts(scoreRowId: number, input: ScoreFactsUpsertInput): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM var.order_score_fact WHERE score_row_id = $1', [scoreRowId]);
    for (const row of input.rows) {
      await client.query(
        `INSERT INTO var.order_score_fact (rand_id, score_row_id, fact_row_id, name, description, ord)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomUUID(), scoreRowId, row.factRowId, row.name ?? null, row.description ?? null, row.ord ?? null]
      );
    }
  });
}

// Items CRUD
export interface ItemRecord { rowId: number; name: string | null; description: string | null; valueMin: number | null; valueMax: number | null; valueDefault: number | null }
export async function listItems(): Promise<ItemRecord[]> {
  const rows = await query<{
    row_id: number;
    name: string | null;
    description: string | null;
    value_min: number | null;
    value_max: number | null;
    value_default: number | null;
  }>(
    `SELECT row_id, name, description, value_min, value_max, value_default FROM var.order_items ORDER BY name NULLS LAST`
  );
  return rows.map((r) => ({ rowId: r.row_id, name: r.name, description: r.description, valueMin: r.value_min, valueMax: r.value_max, valueDefault: r.value_default }));
}

export async function createItem(input: ItemInput): Promise<ItemRecord> {
  const rows = await query<{
    row_id: number;
    name: string | null;
    description: string | null;
    value_min: number | null;
    value_max: number | null;
    value_default: number | null;
  }>(
    `INSERT INTO var.order_items (rand_id, name, description, value_min, value_max, value_default)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING row_id, name, description, value_min, value_max, value_default`,
    [randomUUID(), input.name, input.description ?? null, input.valueMin ?? null, input.valueMax ?? null, input.valueDefault ?? null]
  );
  const row = rows[0];
  return { rowId: row.row_id, name: row.name, description: row.description, valueMin: row.value_min, valueMax: row.value_max, valueDefault: row.value_default };
}

export async function updateItem(rowId: number, input: ItemUpdateInput): Promise<void> {
  await query(
    `UPDATE var.order_items SET name = COALESCE($2, name), description = COALESCE($3, description), value_min = COALESCE($4, value_min), value_max = COALESCE($5, value_max), value_default = COALESCE($6, value_default), up = now() WHERE row_id = $1`,
    [rowId, input.name ?? null, input.description ?? null, input.valueMin ?? null, input.valueMax ?? null, input.valueDefault ?? null]
  );
}

export async function deleteItem(rowId: number): Promise<void> {
  // Application-level cascade for legacy DBs without FK cascades
  await withTransaction(async (client: PoolClient) => {
    await client.query('DELETE FROM var.order_items_variable_ratio WHERE item_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.order_items_score_ratio WHERE item_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.order_auth_item WHERE item_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.matrix_person_item_value WHERE item_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.order_hokm_item WHERE item_row_id = $1', [rowId]);
    await client.query('DELETE FROM var.order_items WHERE row_id = $1', [rowId]);
  });
}

export async function getScoreItemRatios(scoreRowId: number): Promise<Array<{ itemRowId: number; value: number | null }>> {
  const rows = await query<{ item_row_id: number; value: number | null }>(
    `SELECT item_row_id, value FROM var.order_items_score_ratio WHERE score_row_id = $1`,
    [scoreRowId]
  );
  return rows.map((r) => ({ itemRowId: r.item_row_id, value: r.value }));
}

export async function replaceScoreItemRatios(scoreRowId: number, input: ItemsRatioInput): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM var.order_items_score_ratio WHERE score_row_id = $1', [scoreRowId]);
    for (const row of input.rows) {
      await client.query(
        `INSERT INTO var.order_items_score_ratio (rand_id, score_row_id, score_rand_id, item_row_id, item_rand_id, value)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomUUID(), scoreRowId, String(scoreRowId), row.itemRowId, String(row.itemRowId), row.value]
      );
    }
  });
}

export async function getItemScoreRatios(itemRowId: number): Promise<Array<{ scoreRowId: number; value: number | null }>> {
  const rows = await query<{ score_row_id: number; value: number | null }>(
    `SELECT score_row_id, value FROM var.order_items_score_ratio WHERE item_row_id = $1`,
    [itemRowId]
  );
  return rows.map((r) => ({ scoreRowId: r.score_row_id, value: r.value }));
}

export async function replaceItemScoreRatios(itemRowId: number, input: ItemScoresRatioInput): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM var.order_items_score_ratio WHERE item_row_id = $1', [itemRowId]);
    for (const row of input.rows) {
      await client.query(
        `INSERT INTO var.order_items_score_ratio (rand_id, score_row_id, score_rand_id, item_row_id, item_rand_id, value)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomUUID(), row.scoreRowId, String(row.scoreRowId), itemRowId, String(itemRowId), row.value]
      );
    }
  });
}

export async function getVariableItemRatios(variableRowId: number): Promise<Array<{ itemRowId: number; value: number | null }>> {
  const rows = await query<{ item_row_id: number; value: number | null }>(
    `SELECT item_row_id, value FROM var.order_items_variable_ratio WHERE variable_row_id = $1`,
    [variableRowId]
  );
  return rows.map((r) => ({ itemRowId: r.item_row_id, value: r.value }));
}

export async function replaceVariableItemRatios(variableRowId: number, input: ItemsRatioInput): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM var.order_items_variable_ratio WHERE variable_row_id = $1', [variableRowId]);
    for (const row of input.rows) {
      await client.query(
        `INSERT INTO var.order_items_variable_ratio (rand_id, variable_row_id, variable_rand_id, item_row_id, item_rand_id, value)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomUUID(), variableRowId, String(variableRowId), row.itemRowId, String(row.itemRowId), row.value]
      );
    }
  });
}

export async function getItemVariableRatios(itemRowId: number): Promise<Array<{ variableRowId: number; value: number | null }>> {
  const rows = await query<{ variable_row_id: number; value: number | null }>(
    `SELECT variable_row_id, value FROM var.order_items_variable_ratio WHERE item_row_id = $1`,
    [itemRowId]
  );
  return rows.map((r) => ({ variableRowId: r.variable_row_id, value: r.value }));
}

export async function replaceItemVariableRatios(itemRowId: number, input: ItemVariablesRatioInput): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM var.order_items_variable_ratio WHERE item_row_id = $1', [itemRowId]);
    for (const row of input.rows) {
      await client.query(
        `INSERT INTO var.order_items_variable_ratio (rand_id, variable_row_id, variable_rand_id, item_row_id, item_rand_id, value)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomUUID(), row.variableRowId, String(row.variableRowId), itemRowId, String(itemRowId), row.value]
      );
    }
  });
}

// Auths
export interface AuthRecord { rowId: number; name: string | null; description: string | null; percent: number | null }
export async function listAuths(): Promise<AuthRecord[]> {
  const rows = await query<{ row_id: number; name: string | null; description: string | null; percent: number | null }>(
    `SELECT row_id, name, description, percent FROM var.order_auths ORDER BY name NULLS LAST`
  );
  return rows.map((r) => ({ rowId: r.row_id, name: r.name, description: r.description, percent: r.percent }));
}

export async function createAuth(input: AuthInput): Promise<AuthRecord> {
  const rows = await query<{ row_id: number; name: string | null; description: string | null; percent: number | null }>(
    `INSERT INTO var.order_auths (rand_id, name, description, percent)
     VALUES ($1, $2, $3, $4)
     RETURNING row_id, name, description, percent`,
    [randomUUID(), input.name, input.description ?? null, input.percent ?? null]
  );
  const row = rows[0];
  return { rowId: row.row_id, name: row.name, description: row.description, percent: row.percent };
}

export async function updateAuth(rowId: number, input: AuthUpdateInput): Promise<void> {
  await query(
    `UPDATE var.order_auths SET name = COALESCE($2, name), description = COALESCE($3, description), percent = COALESCE($4, percent), up = now() WHERE row_id = $1`,
    [rowId, input.name ?? null, input.description ?? null, input.percent ?? null]
  );
}

export async function deleteAuth(rowId: number): Promise<void> {
  await query('DELETE FROM var.order_auths WHERE row_id = $1', [rowId]);
}

export async function getAuthItems(authRowId: number): Promise<number[]> {
  const rows = await query<{ item_row_id: number }>(
    `SELECT item_row_id FROM var.order_auth_item WHERE auth_row_id = $1`,
    [authRowId]
  );
  return rows.map((r) => r.item_row_id);
}

export async function setAuthItems(authRowId: number, input: AuthItemsInput): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM var.order_auth_item WHERE auth_row_id = $1', [authRowId]);
    for (const itemId of input.itemIds) {
      await client.query(
        `INSERT INTO var.order_auth_item (rand_id, auth_row_id, auth_rand_id, item_row_id)
         VALUES ($1, $2, $3, $4)`,
        [randomUUID(), authRowId, String(authRowId), itemId]
      );
    }
  });
}

// Hokm
export interface HokmYearRecord { rowId: number; year: number | null; yearpercent: number | null }
export async function listHokmYears(): Promise<HokmYearRecord[]> {
  const rows = await query<{ row_id: number; year: number | null; yearpercent: number | null }>(
    `SELECT row_id, year, yearpercent FROM var.order_hokm_year_settings ORDER BY year DESC`
  );
  return rows.map((r) => ({ rowId: r.row_id, year: r.year, yearpercent: r.yearpercent }));
}

export async function createHokmYear(input: HokmYearInput): Promise<HokmYearRecord> {
  const rows = await query<{ row_id: number; year: number | null; yearpercent: number | null }>(
    `INSERT INTO var.order_hokm_year_settings (rand_id, year, yearpercent)
     VALUES ($1, $2, $3)
     RETURNING row_id, year, yearpercent`,
    [randomUUID(), input.year, input.yearpercent]
  );
  const row = rows[0];
  return { rowId: row.row_id, year: row.year, yearpercent: row.yearpercent };
}

export async function updateHokmYear(rowId: number, input: HokmYearInput): Promise<void> {
  await query(
    `UPDATE var.order_hokm_year_settings SET year = COALESCE($2, year), yearpercent = COALESCE($3, yearpercent), up = now() WHERE row_id = $1`,
    [rowId, input.year ?? null, input.yearpercent ?? null]
  );
}

export async function deleteHokmYear(rowId: number): Promise<void> {
  await query('DELETE FROM var.order_hokm_year_settings WHERE row_id = $1', [rowId]);
}

export interface HokmTypeRecord { rowId: number; title: string | null }
export async function listHokmTypes(): Promise<HokmTypeRecord[]> {
  const rows = await query<{ row_id: number; title: string | null }>(
    `SELECT row_id, title FROM var.order_hokm_type ORDER BY title`
  );
  return rows.map((r) => ({ rowId: r.row_id, title: r.title }));
}

export async function createHokmType(input: HokmTypeInput): Promise<HokmTypeRecord> {
  const rows = await query<{ row_id: number; title: string | null }>(
    `INSERT INTO var.order_hokm_type (rand_id, title)
     VALUES ($1, $2)
     RETURNING row_id, title`,
    [randomUUID(), input.title]
  );
  const row = rows[0];
  return { rowId: row.row_id, title: row.title };
}

export async function updateHokmType(rowId: number, input: HokmTypeInput): Promise<void> {
  await query(`UPDATE var.order_hokm_type SET title = COALESCE($2, title), up = now() WHERE row_id = $1`, [rowId, input.title ?? null]);
}

export async function deleteHokmType(rowId: number): Promise<void> {
  await query('DELETE FROM var.order_hokm_type WHERE row_id = $1', [rowId]);
}

export async function listHokmTypeItems(hokmTypeRowId: number): Promise<Array<{ itemRowId: number; percent: number | null }>> {
  const rows = await query<{ item_row_id: number; percent: number | null }>(
    `SELECT item_row_id, percent FROM var.order_hokm_item WHERE hokm_row_id = $1`,
    [hokmTypeRowId]
  );
  return rows.map((r) => ({ itemRowId: r.item_row_id, percent: r.percent }));
}

export async function replaceHokmTypeItems(hokmTypeRowId: number, input: HokmTypeItemsInput): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM var.order_hokm_item WHERE hokm_row_id = $1', [hokmTypeRowId]);
    for (const row of input.rows) {
      await client.query(
        `INSERT INTO var.order_hokm_item (rand_id, hokm_row_id, item_row_id, percent)
         VALUES ($1, $2, $3, $4)`,
        [randomUUID(), hokmTypeRowId, row.itemRowId, row.percent]
      );
    }
  });
}

export interface SimulationResultItem {
  scoreId: number;
  scoreName: string;
  formula: string;
  value: number;
  trace: string[];
}

export interface SimulationResult {
  items: SimulationResultItem[];
  total: number;
}

function evaluateFormula(formula: string, context: Record<string, number>): number {
  const sanitized = formula.replace(/[^0-9a-zA-Z_+\-*/().\s]/g, '');
  const args = Object.keys(context);
  const values = Object.values(context);
  // eslint-disable-next-line no-new-func
  const evaluator = new Function(...args, `return ${sanitized};`);
  return Number(evaluator(...values));
}

function evaluateCondition(condition: string, context: Record<string, number>): boolean {
  const sanitized = condition.replace(/[^0-9a-zA-Z_+\-*/().<>=!&|\s]/g, '');
  const args = Object.keys(context);
  const values = Object.values(context);
  // eslint-disable-next-line no-new-func
  const evaluator = new Function(...args, `return Boolean(${sanitized});`);
  return Boolean(evaluator(...values));
}

interface ScoreVariableMeta {
  id: number;
  name: string | null;
}

async function loadScoreVariableMap(client: PoolClient, scoreIds: number[]) {
  if (scoreIds.length === 0) return new Map<number, ScoreVariableMeta[]>();

  const rows = await client.query<{
    score_row_id: number;
    variable_row_id: number;
    variable_name: string | null;
  }>(
    `SELECT osv.score_row_id,
            osv.variable_row_id,
            ov.name AS variable_name
       FROM var.order_score_variables osv
 INNER JOIN var.order_variables ov
         ON ov.row_id = osv.variable_row_id
      WHERE osv.score_row_id = ANY($1::int[])`,
    [scoreIds]
  );

  const map = new Map<number, ScoreVariableMeta[]>();
  for (const row of rows.rows) {
    const existing = map.get(row.score_row_id) ?? [];
    existing.push({
      id: row.variable_row_id,
      name: row.variable_name
    });
    map.set(row.score_row_id, existing);
  }
  return map;
}

export async function runSimulation(input: SimulationInput): Promise<SimulationResult> {
  const effectiveDate = new Date(input.effectiveDate);
  const context: Record<string, number> = {};
  for (const [key, value] of Object.entries(input.variableValues)) {
    const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
    context[safeKey] = value;
  }

  return withTransaction(async (client) => {
    const scores = await client.query<{
      row_id: number;
      name: string | null;
      formula: string | null;
      condition: string | null;
    }>(
      `SELECT row_id, name, formula, condition
         FROM var.order_scores
        WHERE status = 1
          AND (start_time IS NULL OR start_time <= $1)
          AND (end_time IS NULL OR end_time >= $1)
          AND ($2::text IS NULL OR category = $2::text)`,
      [effectiveDate, input.category ?? null]
    );

    const scoreIds = scores.rows.map((row) => row.row_id);
    const scoreVariableMap = await loadScoreVariableMap(client, scoreIds);

    const items: SimulationResultItem[] = [];
    let total = 0;

    for (const score of scores.rows) {
      if (!score.formula) continue;
      const variableLinks = scoreVariableMap.get(score.row_id) ?? [];
      const trace: string[] = [];
      for (const link of variableLinks) {
        const rawName = (link.name ?? `var_${link.id}`).trim();
        const safeName = rawName.replace(/[^a-zA-Z0-9_]/g, '_') || `var_${link.id}`;
        if (!(safeName in context)) {
          trace.push(`Variable ${safeName} missing, defaulting to 0`);
          context[safeName] = 0;
        } else {
          trace.push(`Variable ${safeName} = ${context[safeName]}`);
        }
        const idAlias = `var_${link.id}`;
        if (!(idAlias in context)) {
          context[idAlias] = context[safeName];
        }
      }

      if (score.condition) {
        const passed = evaluateCondition(score.condition, context);
        trace.push(`Condition "${score.condition}" => ${passed}`);
        if (!passed) {
          // Skip score when condition not met
          continue;
        }
      }

      const value = evaluateFormula(score.formula, context);
      trace.push(`Formula "${score.formula}" => ${value}`);

      const override = input.manualOverrides.find((o) => o.itemId === score.row_id);
      const finalValue = override ? override.value : value;
      if (override) {
        trace.push(`Manual override applied: ${override.value} (${override.reason})`);
      }
      total += finalValue;
      items.push({
        scoreId: score.row_id,
        scoreName: score.name ?? `Score ${score.row_id}`,
        formula: score.formula,
        value: finalValue,
        trace
      });
    }

    return { items, total };
  });
}

export async function duplicateScore(scoreId: number): Promise<ScoreRecord> {
  return withTransaction(async (client) => {
    const current = await client.query<{
      row_id: number;
      name: string | null;
      description: string | null;
      category: string | null;
      rule_set_row_id: number | null;
      condition: string | null;
      formula: string | null;
      score_vop_som: number | null;
      som: number | null;
      value_min: number | null;
      value_max: number | null;
      value_default: number | null;
      start_time: Date | null;
      end_time: Date | null;
    }>(
      `SELECT * FROM var.order_scores WHERE row_id = $1`,
      [scoreId]
    );

    if (current.rowCount === 0) {
      throw Object.assign(new Error('Score not found'), { status: 404 });
    }

    const row = current.rows[0];
    const inserted = await client.query<{ row_id: number; rand_id: string }>(
      `INSERT INTO var.order_scores
        (rand_id, name, description, category, rule_set_row_id, condition, formula, score_vop_som, som, value_min, value_max, value_default, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 2)
       RETURNING row_id, rand_id`,
      [
        randomUUID(),
        row.name,
        row.description,
        row.category,
        row.rule_set_row_id,
        row.condition,
        row.formula,
        row.score_vop_som,
        row.som,
        row.value_min,
        row.value_max,
        row.value_default,
        row.start_time,
        row.end_time
      ]
    );

    const newRow = inserted.rows[0];

    const variables = await client.query<{
      variable_row_id: number;
      variable_name: string | null;
    }>(
      `SELECT v.variable_row_id, ov.name AS variable_name
         FROM var.order_score_variables v
    LEFT JOIN var.order_variables ov
           ON ov.row_id = v.variable_row_id
        WHERE v.score_row_id = $1`,
      [scoreId]
    );

    for (const variable of variables.rows) {
      await client.query(
        `INSERT INTO var.order_score_variables
           (rand_id, score_row_id, score_rand_id, variable_row_id, variable_rand_id, cr, up, rev_seq, status)
         VALUES ($1, $2, $3, $4, $5, now(), now(), 1, 1)`,
        [randomUUID(), newRow.row_id, newRow.rand_id, variable.variable_row_id, String(variable.variable_row_id)]
      );
    }

    return {
      rowId: newRow.row_id,
      randId: newRow.rand_id,
      name: row.name,
      description: row.description,
      category: row.category,
      ruleSetRowId: row.rule_set_row_id,
      condition: row.condition,
      scoreVopSom: row.score_vop_som ? SCORE_VOP_REVERSE.get(row.score_vop_som) ?? null : null,
      som: row.som ? SOM_REVERSE.get(row.som) ?? null : null,
      valueMin: row.value_min,
      valueMax: row.value_max,
      valueDefault: row.value_default,
      formula: row.formula,
      startTime: row.start_time?.toISOString() ?? null,
      endTime: row.end_time?.toISOString() ?? null,
      status: 2,
      variables: variables.rows.map((variable) => ({
        id: variable.variable_row_id,
        name: variable.variable_name
      }))
    };
  });
}

export async function publishScore(scoreId: number): Promise<void> {
  await withTransaction(async (client) => {
    const score = await client.query<{
      row_id: number;
      name: string | null;
      category: string | null;
      start_time: Date | null;
      end_time: Date | null;
    }>(
      `SELECT row_id, name, category, start_time, end_time
         FROM var.order_scores
        WHERE row_id = $1`,
      [scoreId]
    );

    if (score.rowCount === 0) {
      throw Object.assign(new Error('Score not found'), { status: 404 });
    }

    const row = score.rows[0];

    const overlap = await client.query(
      `SELECT 1
         FROM var.order_scores
        WHERE row_id <> $1
          AND name = $2
          AND COALESCE(category, '') = COALESCE($3, '')
          AND status = 1
          AND (COALESCE(start_time, '-infinity') <= COALESCE($4, 'infinity')::timestamp)
          AND (COALESCE(end_time, 'infinity') >= COALESCE($5, '-infinity')::timestamp)
        LIMIT 1`,
      [row.row_id, row.name, row.category, row.end_time, row.start_time]
    );

    if (overlap.rowCount > 0) {
      throw Object.assign(
        new Error('Overlapping active rule exists for the same name/category and effective dates'),
        { status: 400 }
      );
    }

    await client.query(
      `UPDATE var.order_scores
          SET status = 0, up = now()
        WHERE row_id <> $1
          AND name = $2
          AND COALESCE(category, '') = COALESCE($3, '')
          AND status = 1`,
      [row.row_id, row.name, row.category]
    );

    await client.query(`UPDATE var.order_scores SET status = 1, up = now() WHERE row_id = $1`, [row.row_id]);
  });
}

export async function listRuleSets(): Promise<Array<{ rowId: number; name: string; description: string | null }>> {
  const rows = await query<{ row_id: number; name: string; description: string | null }>(
    `SELECT row_id, name, description FROM var.order_rule_sets ORDER BY name`
  );
  return rows.map((row) => ({ rowId: row.row_id, name: row.name, description: row.description }));
}

export async function createRuleSet(name: string, description?: string | null) {
  const rows = await query<{ row_id: number; name: string; description: string | null }>(
    `INSERT INTO var.order_rule_sets (rand_id, name, description)
     VALUES ($1, $2, $3)
     ON CONFLICT (name)
     DO UPDATE SET description = EXCLUDED.description, up = now()
     RETURNING row_id, name, description`,
    [randomUUID(), name, description ?? null]
  );
  const r = rows[0];
  return { rowId: r.row_id, name: r.name, description: r.description };
}
