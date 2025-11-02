import { query } from '../../db/pool';

export interface ArchiveSearchParams {
  personId?: number;
  region?: string;
  issuedFrom?: string;
  issuedTo?: string;
}

export async function searchArchive(params: ArchiveSearchParams) {
  return query<{
    row_id: number;
    salary_no: string;
    pr_rand_id: string | null;
    affected_date: Date | null;
    cr: Date;
  }>(
    `SELECT row_id, salary_no, pr_rand_id, affected_date, cr
       FROM var.order_salary
      WHERE ($1::text IS NULL OR pr_rand_id = $1::text)
        AND ($2::timestamp IS NULL OR cr >= $2::timestamp)
        AND ($3::timestamp IS NULL OR cr <= $3::timestamp)
      ORDER BY cr DESC
      LIMIT 200`,
    [
      params.personId ? String(params.personId) : null,
      params.issuedFrom ? new Date(params.issuedFrom) : null,
      params.issuedTo ? new Date(params.issuedTo) : null
    ]
  );
}

export async function getDecreeItems(salaryRowId: number) {
  return query<{
    item_row_id: number;
    value: number | null;
  }>(
    `SELECT item_row_id, value
       FROM var.matrix_person_item_value
      WHERE item_rand_id LIKE $1::text || ':%'`,
    [String(salaryRowId)]
  );
}

export async function compareDecrees(leftId: number, rightId: number) {
  const [left, right] = await Promise.all([
    getDecreeItems(leftId),
    getDecreeItems(rightId)
  ]);
  const map = new Map<number, { left?: number | null; right?: number | null }>();

  for (const item of left) {
    map.set(item.item_row_id, { left: item.value ?? 0, right: undefined });
  }
  for (const item of right) {
    const entry = map.get(item.item_row_id) ?? {};
    entry.right = item.value ?? 0;
    map.set(item.item_row_id, entry);
  }

  return Array.from(map.entries()).map(([itemId, values]) => ({
    itemId,
    left: values.left ?? 0,
    right: values.right ?? 0,
    delta: (values.right ?? 0) - (values.left ?? 0)
  }));
}
