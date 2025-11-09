-- Final consolidated schema (applies the latest state of all migrations)
-- Schema: var

CREATE SCHEMA IF NOT EXISTS var;

-- Core catalog: entity kinds and entities
CREATE TABLE IF NOT EXISTS var.entity_kind (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  kind_name TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS var.entity (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  kind_id INT NOT NULL REFERENCES var.entity_kind(row_id) ON DELETE RESTRICT,
  name TEXT,
  status SMALLINT DEFAULT 1,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Members per entity (multiple allowed)
CREATE TABLE IF NOT EXISTS var.entity_member (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  entity_id INT NOT NULL REFERENCES var.entity(row_id) ON DELETE CASCADE
);

-- Dynamic attributes (EAV metadata)
CREATE TABLE IF NOT EXISTS var.attribute_def (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  kind_id INT NOT NULL REFERENCES var.entity_kind(row_id) ON DELETE RESTRICT,
  context_row_id INT NOT NULL REFERENCES var.entity(row_id) ON DELETE RESTRICT,
  attribute_name TEXT NOT NULL,
  attribute_som INT,
  data_type TEXT NOT NULL,
  input_types TEXT,
  -- enhancements
  display_name TEXT,
  category TEXT,
  description TEXT,
  default_value JSONB,
  validation_rules JSONB,
  is_visible BOOLEAN DEFAULT TRUE,
  is_editable BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  depends_on_attribute_id INT REFERENCES var.attribute_def(row_id) ON DELETE CASCADE,
  depends_on_value JSONB,
  start_time TIMESTAMPTZ DEFAULT NULL,
  end_time TIMESTAMPTZ DEFAULT NULL,
  CONSTRAINT attribute_def_data_type_check CHECK (data_type IN ('string','real','date','bool','json')),
  UNIQUE(kind_id, attribute_name)
);

CREATE TABLE IF NOT EXISTS var.attribute_options (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  attribute_id INT NOT NULL REFERENCES var.attribute_def(row_id) ON DELETE CASCADE,
  value TEXT
);

-- EAV value store (member-scoped)
CREATE TABLE IF NOT EXISTS var.eav (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  entity_id INT NOT NULL REFERENCES var.entity(row_id) ON DELETE CASCADE,
  member_row_id INT REFERENCES var.entity_member(row_id) ON DELETE CASCADE,
  attribute_id INT NOT NULL REFERENCES var.attribute_def(row_id) ON DELETE CASCADE,
  value_string TEXT,
  value_real REAL,
  value_date DATE,
  value_bool BOOLEAN,
  value_json JSONB,
  option_row_id INT REFERENCES var.attribute_options(row_id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ DEFAULT NULL,
  end_time TIMESTAMPTZ DEFAULT NULL,
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dependencies between attributes
CREATE TABLE IF NOT EXISTS var.attribute_dependencies (
  row_id SERIAL PRIMARY KEY,
  attribute_id INT NOT NULL REFERENCES var.attribute_def(row_id) ON DELETE CASCADE,
  depends_on_attribute_id INT NOT NULL REFERENCES var.attribute_def(row_id) ON DELETE CASCADE,
  condition JSONB,
  UNIQUE (attribute_id, depends_on_attribute_id)
);

-- Attribute change log
CREATE TABLE IF NOT EXISTS var.attribute_change_log (
  row_id BIGSERIAL PRIMARY KEY,
  attribute_id INT NOT NULL REFERENCES var.attribute_def(row_id) ON DELETE CASCADE,
  entity_id INT NOT NULL REFERENCES var.entity(row_id) ON DELETE CASCADE,
  old_value JSONB,
  new_value JSONB,
  changed_by TEXT,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Rule engine: rule sets
CREATE TABLE IF NOT EXISTS var.order_rule_sets (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT UNIQUE,
  description TEXT
);

-- Variables
CREATE TABLE IF NOT EXISTS var.order_variables (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  name TEXT,
  description TEXT,
  category TEXT,
  rule_set_row_id INT REFERENCES var.order_rule_sets(row_id) ON DELETE SET NULL,
  variable_vop SMALLINT,
  value_min REAL,
  value_max REAL,
  value_default REAL,
  start_time TIMESTAMPTZ DEFAULT NULL,
  end_time TIMESTAMPTZ DEFAULT NULL,
  som SMALLINT
);

CREATE TABLE IF NOT EXISTS var.order_variable_fact (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  variable_row_id INT REFERENCES var.order_variables(row_id) ON DELETE CASCADE,
  fact_row_id INT
);

CREATE TABLE IF NOT EXISTS var.order_variables_options (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  variable_row_id INT REFERENCES var.order_variables(row_id) ON DELETE CASCADE,
  variable_rand_id TEXT,
  composition TEXT,
  value TEXT
);

-- Scores
CREATE TABLE IF NOT EXISTS var.order_scores (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  start_time TIMESTAMPTZ DEFAULT NULL,
  end_time TIMESTAMPTZ DEFAULT NULL,
  name TEXT,
  description TEXT,
  category TEXT,
  rule_set_row_id INT REFERENCES var.order_rule_sets(row_id) ON DELETE SET NULL,
  value_min REAL,
  value_max REAL,
  value_default REAL,
  score_vop_som SMALLINT,
  formula TEXT,
  condition TEXT,
  som SMALLINT
);

CREATE TABLE IF NOT EXISTS var.order_score_options (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  score_row_id INT REFERENCES var.order_scores(row_id) ON DELETE CASCADE,
  score_rand_id TEXT,
  composition TEXT,
  value REAL
);

CREATE TABLE IF NOT EXISTS var.order_score_fact (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  score_row_id INT REFERENCES var.order_scores(row_id) ON DELETE CASCADE,
  fact_row_id INT,
  name TEXT,
  description TEXT,
  ord INT
);

CREATE TABLE IF NOT EXISTS var.order_score_variables (
  row_id SERIAL PRIMARY KEY,
  score_row_id INT REFERENCES var.order_scores(row_id) ON DELETE CASCADE,
  variable_row_id INT REFERENCES var.order_variables(row_id) ON DELETE CASCADE,
  rand_id TEXT,
  score_rand_id TEXT,
  variable_rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT
);

-- Items
CREATE TABLE IF NOT EXISTS var.order_items (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  start_time TIMESTAMPTZ DEFAULT NULL,
  end_time TIMESTAMPTZ DEFAULT NULL,
  name TEXT,
  description TEXT,
  value_min REAL,
  value_max REAL,
  value_default REAL
);

CREATE TABLE IF NOT EXISTS var.order_items_score_ratio (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  score_row_id INT REFERENCES var.order_scores(row_id) ON DELETE CASCADE,
  score_rand_id TEXT,
  item_row_id INT REFERENCES var.order_items(row_id) ON DELETE CASCADE,
  item_rand_id TEXT,
  value REAL
);

CREATE TABLE IF NOT EXISTS var.order_items_variable_ratio (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  variable_row_id INT REFERENCES var.order_variables(row_id) ON DELETE CASCADE,
  variable_rand_id TEXT,
  item_row_id INT REFERENCES var.order_items(row_id) ON DELETE CASCADE,
  item_rand_id TEXT,
  value REAL
);

-- Auths
CREATE TABLE IF NOT EXISTS var.order_auths (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  start_time TIMESTAMPTZ DEFAULT NULL,
  end_time TIMESTAMPTZ DEFAULT NULL,
  name TEXT,
  description TEXT,
  item_row_id_bigger SERIAL,
  percent REAL
);

CREATE TABLE IF NOT EXISTS var.order_auth_item (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  auth_row_id INT REFERENCES var.order_auths(row_id) ON DELETE CASCADE,
  auth_rand_id TEXT,
  item_row_id INT REFERENCES var.order_items(row_id) ON DELETE CASCADE,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT
);

-- Hokm settings
CREATE TABLE IF NOT EXISTS var.order_hokm_year_settings (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  year INT,
  yearpercent REAL
);

CREATE TABLE IF NOT EXISTS var.order_hokm_type (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  title TEXT
);

CREATE TABLE IF NOT EXISTS var.order_hokm_item (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  hokm_row_id INT REFERENCES var.order_hokm_type(row_id) ON DELETE CASCADE,
  item_row_id INT REFERENCES var.order_items(row_id) ON DELETE CASCADE,
  percent REAL
);

-- Person-variable values (used by hokm calc)
CREATE TABLE IF NOT EXISTS var.person_variable_values (
  row_id BIGSERIAL,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  variable_row_id INT REFERENCES var.order_variables(row_id) ON DELETE CASCADE,
  variable_rand_id TEXT,
  pr_rand_id TEXT,
  start_time TIMESTAMPTZ DEFAULT NULL,
  end_time TIMESTAMPTZ DEFAULT NULL,
  option_row_id INT REFERENCES var.order_variables_options(row_id) ON DELETE SET NULL,
  PRIMARY KEY (variable_row_id, row_id)
);

-- Matrices
CREATE TABLE IF NOT EXISTS var.matrix_person_score_values (
  row_id BIGSERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  score_row_id INT REFERENCES var.order_scores(row_id) ON DELETE CASCADE,
  score_rand_id TEXT,
  pr_rand_id TEXT,
  start_time TIMESTAMPTZ DEFAULT NULL,
  end_time TIMESTAMPTZ DEFAULT NULL,
  value REAL
);

CREATE TABLE IF NOT EXISTS var.matrix_person_item_value (
  row_id BIGSERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  item_row_id INT REFERENCES var.order_items(row_id) ON DELETE CASCADE,
  item_rand_id TEXT,
  pr_rand_id TEXT,
  value REAL
);

-- Salary
CREATE TABLE IF NOT EXISTS var.order_salary (
  row_id SERIAL PRIMARY KEY,
  rand_id TEXT,
  cr TIMESTAMPTZ DEFAULT now() NOT NULL,
  up TIMESTAMPTZ DEFAULT now() NOT NULL,
  rev_seq SMALLINT DEFAULT 1 NOT NULL,
  status SMALLINT,
  pr_rand_id TEXT,
  affected_date TIMESTAMPTZ DEFAULT NULL,
  hokm_type_row_id INT REFERENCES var.order_hokm_type(row_id) ON DELETE SET NULL,
  salary_no TEXT
);

-- Unique and helper indexes
CREATE INDEX IF NOT EXISTS idx_entity_kind_name ON var.entity_kind (kind_name);
CREATE INDEX IF NOT EXISTS idx_entity_kind ON var.entity (kind_id);
CREATE INDEX IF NOT EXISTS idx_attribute_kind ON var.attribute_def (kind_id);
CREATE INDEX IF NOT EXISTS idx_attribute_entity ON var.eav (entity_id);
CREATE INDEX IF NOT EXISTS idx_eav_member ON var.eav (member_row_id);
CREATE INDEX IF NOT EXISTS idx_order_variables_time ON var.order_variables (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_order_scores_time ON var.order_scores (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_order_items_time ON var.order_items (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_person_variable_values_time ON var.person_variable_values (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_order_scores_status_time ON var.order_scores (status, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_order_scores_category ON var.order_scores (category);
CREATE INDEX IF NOT EXISTS idx_order_scores_set ON var.order_scores (rule_set_row_id);

-- Final EAV uniqueness: by member if set, otherwise by entity (legacy)
CREATE UNIQUE INDEX IF NOT EXISTS uq_eav_member_attr
  ON var.eav (member_row_id, attribute_id)
  WHERE member_row_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_eav_entity_attr_legacy
  ON var.eav (entity_id, attribute_id)
  WHERE member_row_id IS NULL;

-- Hokm calculation function (points and amount)
CREATE OR REPLACE FUNCTION var.fn_calc_hokm_items(
  p_pr_rand_id text,
  p_year integer)
RETURNS TABLE(item_name text, item_rand_id text, points numeric, amount_rial numeric)
LANGUAGE plpgsql
AS $$
DECLARE
  v_yearcoef numeric;
BEGIN
  SELECT yearpercent::numeric INTO v_yearcoef
  FROM var.order_hokm_year_settings
  WHERE year = p_year AND COALESCE(status,1)=1
  ORDER BY up DESC NULLS LAST
  LIMIT 1;

  IF v_yearcoef IS NULL THEN
    RAISE EXCEPTION 'Year % not found in var.order_hokm_year_settings', p_year;
  END IF;

  RETURN QUERY
  WITH pv AS (
    SELECT v.row_id AS variable_row_id, v.rand_id AS variable_rand_id, (o.value)::numeric AS var_value
    FROM var.person_variable_values pvv
    JOIN var.order_variables v        ON v.row_id = pvv.variable_row_id
    JOIN var.order_variables_options o ON o.row_id = pvv.option_row_id
    WHERE pvv.pr_rand_id = p_pr_rand_id
      AND COALESCE(pvv.status,1)=1 AND COALESCE(v.status,1)=1 AND COALESCE(o.status,1)=1
  ),
  item_points AS (
    SELECT i.name AS item_name, i.rand_id AS item_rand_id,
           SUM((COALESCE(r.value,1)::numeric) * pv.var_value)::numeric AS points
    FROM var.order_items i
    JOIN var.order_items_variable_ratio r ON r.item_row_id = i.row_id AND COALESCE(r.status,1)=1
    JOIN pv ON pv.variable_row_id = r.variable_row_id
    WHERE COALESCE(i.status,1)=1
    GROUP BY i.name, i.rand_id
  )
  SELECT ip.item_name, ip.item_rand_id, ip.points::numeric, (ip.points * v_yearcoef)::numeric AS amount_rial
  FROM item_points ip
  WHERE ip.points IS NOT NULL;

  RETURN QUERY
  SELECT i.name AS item_name, i.rand_id AS item_rand_id, NULL::numeric AS points, (mpi.value)::numeric AS amount_rial
  FROM var.matrix_person_item_value mpi
  JOIN var.order_items i ON i.row_id = mpi.item_row_id
  WHERE mpi.pr_rand_id = p_pr_rand_id
    AND COALESCE(mpi.status,1)=1 AND COALESCE(i.status,1)=1;
END;
$$;


----------------fn_calc_person_item_values
CREATE OR REPLACE FUNCTION var.fn_calc_person_item_values(
  p_status SMALLINT,
  p_pr_rand_id TEXT,
  p_affected_date TIMESTAMPTZ DEFAULT NULL,
  p_hokm_type_row_id INT DEFAULT NULL,
  p_salary_no TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_year INT;
  v_year_coef REAL;
  v_allowed_items_count INT;
  v_auth RECORD;
  v_big_item_id INT;
  v_sum_children REAL;
  v_cap REAL;
BEGIN
  -- پاک‌سازی قبلیِ آیتم‌های این فرد (بازمحاسبه)
  DELETE FROM var.matrix_person_item_value
  WHERE pr_rand_id = p_pr_rand_id;

  -- 1) محاسبه مجموع وریبل‌ها (با ضرایب آیتم/وریبل)
  WITH var_sum AS (
    SELECT
      r.item_row_id,
      i.rand_id AS item_rand_id,
      i.start_time,
      i.end_time,
      SUM( COALESCE(r.value,1) * (vo.value::REAL) ) AS total_var
    FROM var.order_items_variable_ratio r
    JOIN var.order_items i
      ON i.row_id = r.item_row_id
     AND COALESCE(i.status,1) = p_status
     AND (i.start_time IS NULL OR i.start_time <= p_affected_date)
     AND (i.end_time   IS NULL OR i.end_time   >= p_affected_date)
    JOIN var.person_variable_values pv
      ON pv.variable_row_id = r.variable_row_id
     AND pv.pr_rand_id = p_pr_rand_id
     AND COALESCE(pv.status,1) = p_status
    JOIN var.order_variables_options vo
      ON vo.row_id = pv.option_row_id
     AND COALESCE(vo.status,1) = p_status
    WHERE COALESCE(r.status,1) = p_status
    GROUP BY r.item_row_id, i.rand_id, i.start_time, i.end_time
  ),
  score_sum AS (
    SELECT
      r.item_row_id,
      i.rand_id AS item_rand_id,
      i.start_time,
      i.end_time,
      SUM( COALESCE(r.value,1) * m.value ) AS total_score
    FROM var.order_items_score_ratio r
    JOIN var.order_items i
      ON i.row_id = r.item_row_id
     AND COALESCE(i.status,1) = p_status
     AND (i.start_time IS NULL OR i.start_time <= p_affected_date)
     AND (i.end_time   IS NULL OR i.end_time   >= p_affected_date)
    JOIN var.matrix_person_score_values m
      ON m.score_row_id = r.score_row_id
     AND m.pr_rand_id   = p_pr_rand_id
     AND COALESCE(m.status,1) = p_status
    WHERE COALESCE(r.status,1) = p_status
    GROUP BY r.item_row_id, i.rand_id, i.start_time, i.end_time
  ),
  all_items AS (
    SELECT
      COALESCE(v.item_row_id, s.item_row_id) AS item_row_id,
      COALESCE(v.item_rand_id, s.item_rand_id) AS item_rand_id,
      COALESCE(v.start_time, s.start_time) AS start_time,
      COALESCE(v.end_time, s.end_time) AS end_time,
      COALESCE(v.total_var, 0) + COALESCE(s.total_score, 0) AS item_value
    FROM var_sum v
    FULL OUTER JOIN score_sum s
      ON s.item_row_id = v.item_row_id
  ),
  ins AS (
    INSERT INTO var.matrix_person_item_value (
      rand_id, item_row_id, item_rand_id, pr_rand_id,
      value, /*price: بعداً*/ 
      cr, up, rev_seq, status
    )
    SELECT
      gen_random_uuid()::TEXT,
      a.item_row_id,
      a.item_rand_id,
      p_pr_rand_id,
      a.item_value,
      now(), now(), 1, p_status
    FROM all_items a
    WHERE a.item_value IS NOT NULL
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_allowed_items_count FROM ins;  -- صرفاً برای «گرم‌شدن» و سلامت

  -- 2) اعمال Auth ها (سقف‌گذاری)
  FOR v_auth IN
    SELECT *
    FROM var.order_auths
    WHERE COALESCE(status,1) = p_status
      AND (start_time IS NULL OR start_time <= p_affected_date)
      AND (end_time   IS NULL OR end_time   >= p_affected_date)
  LOOP
    v_big_item_id := v_auth.item_row_id_bigger;

    -- جمع آیتم‌های زیرمجموعه این Auth برای همین فرد
    SELECT SUM(m.value)
    INTO v_sum_children
    FROM var.order_auth_item ai
    JOIN var.matrix_person_item_value m
      ON m.item_row_id = ai.item_row_id
     AND m.pr_rand_id  = p_pr_rand_id
     AND COALESCE(m.status,1) = p_status
    WHERE ai.auth_row_id = v_auth.row_id
      AND COALESCE(ai.status,1) = p_status;

    IF v_sum_children IS NULL THEN
      CONTINUE;
    END IF;

    v_cap := v_sum_children * COALESCE(v_auth.percent,0)::REAL;

    -- اگر آیتم بزرگ‌تر از سقف شد، به سقف کاهش داده شود
    UPDATE var.matrix_person_item_value m
    SET value = v_cap, up = now()
    WHERE m.pr_rand_id  = p_pr_rand_id
      AND m.item_row_id = v_big_item_id
      AND COALESCE(m.status,1) = p_status
      AND m.value > v_cap;
  END LOOP;

  -- 3) اعمال نوع حکم (فقط آیتم‌های عضو این نوع حکم بمانند و در درصدشان ضرب شوند)
  -- حذف آیتم‌های غیرعضو نوع حکم
  DELETE FROM var.matrix_person_item_value m
  WHERE m.pr_rand_id = p_pr_rand_id
    AND COALESCE(m.status,1) = p_status
    AND NOT EXISTS (
      SELECT 1
      FROM var.order_hokm_item hi
      WHERE hi.hokm_row_id = p_hokm_type_row_id
        AND hi.item_row_id = m.item_row_id
        AND COALESCE(hi.status,1) = p_status
    );

  -- ضرب درصد نوع حکم در آیتم‌های باقی‌مانده
  UPDATE var.matrix_person_item_value m
  SET value = m.value * COALESCE(hi.percent,1)::REAL,
      up    = now()
  FROM var.order_hokm_item hi
  WHERE hi.hokm_row_id = p_hokm_type_row_id
    AND hi.item_row_id = m.item_row_id
    AND COALESCE(hi.status,1) = p_status
    AND m.pr_rand_id = p_pr_rand_id
    AND COALESCE(m.status,1) = p_status;

  -- 4) اعمال ضریب سال و ذخیره در price
  v_year := EXTRACT(YEAR FROM p_affected_date)::INT;

  SELECT yearpercent::REAL INTO v_year_coef
  FROM var.order_hokm_year_settings
  WHERE year = v_year
    AND COALESCE(status,1) = p_status
  ORDER BY up DESC NULLS LAST
  LIMIT 1;

  IF v_year_coef IS NULL THEN
    RAISE EXCEPTION 'Year % not found in var.order_hokm_year_settings with status %', v_year, p_status;
  END IF;

  UPDATE var.matrix_person_item_value
  SET price = value * v_year_coef,
      up    = now()
  WHERE pr_rand_id = p_pr_rand_id
    AND COALESCE(status,1) = p_status;

END;
$$;


------------------------

CREATE OR REPLACE FUNCTION var.fn_calc_person_score_values(
  p_status SMALLINT,
  p_pr_rand_id TEXT,
  p_affected_date TIMESTAMPTZ DEFAULT NULL,
  p_hokm_type_row_id INT DEFAULT NULL,
  p_salary_no TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_score RECORD;
  v_opt RECORD;
  v_attr TEXT;
  v_value REAL;
  v_match BOOLEAN;
  v_member_row_id INT;
  x REAL;
  sum_vars REAL;
BEGIN
  -- 🧭 یافتن member_row_id واقعی
  SELECT row_id INTO v_member_row_id
  FROM var.entity_member
  WHERE rand_id = p_pr_rand_id
  LIMIT 1;

  IF v_member_row_id IS NULL THEN
    RAISE EXCEPTION 'Member with rand_id % not found', p_pr_rand_id;
  END IF;

  -- 🧹 حذف رکوردهای قبلی
  DELETE FROM var.matrix_person_score_values WHERE pr_rand_id = p_pr_rand_id;

  -- 🔁 حلقه روی اسکورهای معتبر
  FOR v_score IN
    SELECT *
    FROM var.order_scores
    WHERE COALESCE(status,1) = p_status
      AND (start_time IS NULL OR start_time <= p_affected_date)
      AND (end_time IS NULL OR end_time >= p_affected_date)
  LOOP

    -- پیش‌فرض هیچ x تعیین نشده
    x := NULL;

    -- بررسی آپشن‌های هر اسکور
    FOR v_opt IN
      SELECT * FROM var.order_score_options
      WHERE score_row_id = v_score.row_id
        AND COALESCE(status,1) = p_status
    LOOP
      v_match := TRUE;

      -- پردازش composition مثل 4:3 یا 5:2||5
      FOR v_attr IN
        SELECT unnest(string_to_array(v_opt.composition, ',')) AS pair
      LOOP
        -- بررسی وجود attribute در eav
        IF NOT EXISTS (
          SELECT 1 FROM var.eav e
          WHERE e.member_row_id = v_member_row_id
            AND e.attribute_id = split_part(v_attr, ':', 1)::INT
            AND (e.start_time IS NULL OR e.start_time <= p_affected_date)
            AND (e.end_time IS NULL OR e.end_time >= p_affected_date)
        ) THEN
          v_match := FALSE;
          EXIT;
        END IF;

        -- بررسی شرط بسته به نوع som
        IF v_score.som = 0 THEN
          IF NOT EXISTS (
            SELECT 1 FROM var.eav e
            WHERE e.member_row_id = v_member_row_id
              AND e.attribute_id = split_part(v_attr, ':', 1)::INT
              AND e.option_row_id = split_part(v_attr, ':', 2)::INT
              AND (e.start_time IS NULL OR e.start_time <= p_affected_date)
              AND (e.end_time IS NULL OR e.end_time >= p_affected_date)
          ) THEN
            v_match := FALSE;
            EXIT;
          END IF;

        ELSIF v_score.som = 1 THEN
          SELECT e.value_real INTO v_value
          FROM var.eav e
          WHERE e.member_row_id = v_member_row_id
            AND e.attribute_id = split_part(v_attr, ':', 1)::INT
            AND (e.start_time IS NULL OR e.start_time <= p_affected_date)
            AND (e.end_time IS NULL OR e.end_time >= p_affected_date)
          LIMIT 1;

          IF v_value IS NULL OR
             v_value < split_part(split_part(v_attr, ':', 2), '||', 1)::REAL OR
             v_value > split_part(split_part(v_attr, ':', 2), '||', 2)::REAL THEN
            v_match := FALSE;
            EXIT;
          END IF;
        END IF;
      END LOOP;

      -- اگر تمام شروط برقرار بود، مقدار x تنظیم شود
      IF v_match THEN
        x := v_opt.value::REAL;
        EXIT;
      END IF;
    END LOOP;

    -- اگر x پیدا نشد، ادامه نده
    IF x IS NULL THEN
      CONTINUE;
    END IF;

    -- محاسبه مجموع وریبل‌های مرتبط
    SELECT SUM(vv.value::REAL)
    INTO sum_vars
    FROM var.order_score_variables sv
    JOIN var.person_variable_values pv ON pv.variable_row_id = sv.variable_row_id
    JOIN var.order_variables_options vo ON vo.row_id = pv.option_row_id
    WHERE sv.score_row_id = v_score.row_id
      AND pv.pr_rand_id = p_pr_rand_id
      AND COALESCE(pv.status,1) = p_status
      AND COALESCE(vo.status,1) = p_status;

    -- درج مقدار نهایی در جدول
    IF sum_vars IS NOT NULL THEN
      INSERT INTO var.matrix_person_score_values (
        rand_id,
        score_row_id,
        score_rand_id,
        pr_rand_id,
        value,
        start_time,
        end_time,
        status
      )
      VALUES (
        gen_random_uuid()::TEXT,
        v_score.row_id,
        v_score.rand_id,
        p_pr_rand_id,
        (sum_vars * x)::REAL,
        v_score.start_time,
        v_score.end_time,
        p_status
      );
    END IF;
  END LOOP;
END;
$$;