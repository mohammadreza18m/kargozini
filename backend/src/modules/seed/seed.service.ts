import { randomUUID } from 'crypto';
import { withTransaction } from '../../db/transaction';

export async function runSeed() {
  await withTransaction(async (client) => {
    const kindResult = await client.query<{ row_id: number }>(
      `INSERT INTO var.entity_kind (rand_id, kind_name)
       VALUES ($1, $2)
       ON CONFLICT (kind_name)
       DO UPDATE SET kind_name = EXCLUDED.kind_name
       RETURNING row_id`,
      [randomUUID(), 'teacher']
    );

    const kindId = kindResult.rows[0].row_id;

    const contextResult = await client.query<{ row_id: number }>(
      `INSERT INTO var.entity (rand_id, kind_id, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (name)
       DO UPDATE SET up = now()
       RETURNING row_id`,
      [randomUUID(), kindId, 'rule-context:teacher']
    );

    const contextRowId = contextResult.rows[0].row_id;

    await client.query(
      `INSERT INTO var.attribute_def
         (rand_id, kind_id, context_row_id, attribute_name, data_type)
       VALUES ($1, $2, $3, 'rank', 'string')
       ON CONFLICT (kind_id, attribute_name) DO NOTHING`,
      [randomUUID(), kindId, contextRowId]
    );

    await client.query(
      `INSERT INTO var.order_variables
         (rand_id, name, description, variable_vop, som, status)
       VALUES ($1, 'baseScore', 'Base salary score', 1, 1, 1)
       ON CONFLICT (name) DO NOTHING`,
      [randomUUID()]
    );
  });
}
