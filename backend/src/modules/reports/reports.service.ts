import { query } from '../../db/pool';

export async function reportDecreeIssuance() {
  return query<{
    month: string;
    count: number;
  }>(
    `SELECT to_char(date_trunc('month', cr), 'YYYY-MM') AS month,
            COUNT(*) AS count
       FROM var.order_salary
   GROUP BY 1
   ORDER BY 1 DESC
   LIMIT 12`
  );
}

export async function reportAverageSalary() {
  return query<{
    rank: string | null;
    average: number | null;
  }>(
    `SELECT eav.value_string AS rank,
            AVG(items.value) AS average
       FROM var.matrix_person_item_value items
 INNER JOIN var.order_salary salary
         ON salary.pr_rand_id = items.pr_rand_id
  LEFT JOIN var.eav eav
         ON eav.entity_id = salary.pr_rand_id::int
        AND eav.attribute_id = (
              SELECT attribute_def.row_id
                FROM var.attribute_def attribute_def
               WHERE attribute_def.attribute_name = 'rank'
               LIMIT 1
            )
   GROUP BY eav.value_string
   ORDER BY average DESC NULLS LAST`
  );
}

export async function reportOverrideAlerts() {
  return query<{
    salary_no: string;
    item_row_id: number;
    value: number | null;
  }>(
    `SELECT salary.salary_no,
            items.item_row_id,
            items.value
       FROM var.matrix_person_item_value items
 INNER JOIN var.order_salary salary
         ON salary.pr_rand_id = items.pr_rand_id
      WHERE items.status = 2 -- manual override marker
      ORDER BY salary.cr DESC
      LIMIT 100`
  );
}
