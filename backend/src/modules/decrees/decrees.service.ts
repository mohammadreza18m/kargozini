import { randomUUID } from 'crypto';
import { query } from '../../db/pool';
import { withTransaction } from '../../db/transaction';
import type { SimulationResult } from '../rules/rules.service';
import { runSimulation } from '../rules/rules.service';
import type { DecreePreviewInput } from './decrees.schemas';

export interface DecreeRecord {
  rowId: number;
  salaryNo: string;
  total: number;
  issuedAt: string;
  hokmTypeRowId: number | null;
  items: SimulationResult['items'];
}

export async function previewDecree(input: DecreePreviewInput): Promise<SimulationResult> {
  return runSimulation({
    effectiveDate: input.effectiveDate,
    variableValues: input.variableValues,
    manualOverrides: input.manualOverrides
  });
}

export async function finalizeDecree(input: DecreePreviewInput): Promise<DecreeRecord> {
  const simulation = await previewDecree(input);
  return withTransaction(async (client) => {
    const salaryNo = `H${Date.now()}`;
    const result = await client.query<{
      row_id: number;
      salary_no: string;
      hokm_type_row_id: number | null;
      cr: Date;
    }>(
      `INSERT INTO var.order_salary
         (rand_id, pr_rand_id, affected_date, hokm_type_row_id, salary_no, status)
       VALUES ($1, $2, $3, $4, $5, 1)
       RETURNING row_id, salary_no, hokm_type_row_id, cr`,
      [
        randomUUID(),
        String(input.personId),
        new Date(input.effectiveDate),
        input.hokmTypeRowId ?? null,
        salaryNo
      ]
    );

    const salaryRow = result.rows[0];

    for (const item of simulation.items) {
      const itemRandId = `${salaryRow.row_id}:${item.scoreId}`;
      await client.query(
        `INSERT INTO var.matrix_person_item_value
           (rand_id, item_row_id, item_rand_id, pr_rand_id, value, status)
         VALUES ($1, $2, $3, $4, $5, 1)`,
        [randomUUID(), item.scoreId, itemRandId, String(input.personId), item.value]
      );
    }

    return {
      rowId: salaryRow.row_id,
      salaryNo: salaryRow.salary_no,
      total: simulation.total,
      issuedAt: salaryRow.cr.toISOString(),
      hokmTypeRowId: salaryRow.hokm_type_row_id,
      items: simulation.items
    };
  });
}

export async function listDecrees(personId?: number) {
  return query<{
    row_id: number;
    salary_no: string;
    affected_date: Date | null;
    hokm_type_row_id: number | null;
    cr: Date;
  }>(
    `SELECT row_id, salary_no, affected_date, hokm_type_row_id, cr
       FROM var.order_salary
      WHERE ($1::text IS NULL OR pr_rand_id = $1::text)
      ORDER BY cr DESC
      LIMIT 200`,
    [personId ? String(personId) : null]
  );
}
