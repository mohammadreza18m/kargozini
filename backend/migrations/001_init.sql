CREATE SCHEMA IF NOT EXISTS var;

CREATE TABLE IF NOT EXISTS var.entity_kind (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    kind_name TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS var.entity (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    kind_id INT NOT NULL REFERENCES var.entity_kind(row_id),
    name TEXT,
    status SMALLINT DEFAULT 1,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS var.attribute_def (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    kind_id INT NOT NULL REFERENCES var.entity_kind(row_id),
    context_row_id INT NOT NULL REFERENCES var.entity(row_id),
    attribute_name TEXT NOT NULL,
    attribute_som INT,
    data_type TEXT NOT NULL CHECK (data_type IN ('string', 'real', 'date', 'bool')),
    input_types TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    UNIQUE(kind_id, attribute_name)
);

CREATE TABLE IF NOT EXISTS var.attribute_options (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    attribute_id INT NOT NULL REFERENCES var.attribute_def(row_id),
    value TEXT
);

CREATE TABLE IF NOT EXISTS var.eav (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    entity_id INT NOT NULL REFERENCES var.entity(row_id),
    attribute_id INT NOT NULL REFERENCES var.attribute_def(row_id),
    value_string TEXT,
    value_real REAL,
    value_date DATE,
    value_bool BOOLEAN,
    option_row_id INT REFERENCES var.attribute_options(row_id),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    CONSTRAINT unique_entity_property UNIQUE(entity_id, attribute_id)
);

CREATE TABLE IF NOT EXISTS var.order_variables (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    name TEXT,
    description TEXT,
    variable_vop SMALLINT,
    value_min REAL,
    value_max REAL,
    value_default REAL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    som SMALLINT
);

CREATE TABLE IF NOT EXISTS var.order_variable_fact (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    variable_row_id INT REFERENCES var.order_variables(row_id),
    fact_row_id INT
);

CREATE TABLE IF NOT EXISTS var.order_variables_options (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    variable_row_id INT REFERENCES var.order_variables(row_id),
    variable_rand_id TEXT,
    composition TEXT,
    value TEXT
);

CREATE TABLE IF NOT EXISTS var.order_scores (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    name TEXT,
    description TEXT,
    value_min REAL,
    value_max REAL,
    value_default REAL,
    score_vop_som SMALLINT,
    formula TEXT,
    som SMALLINT
);

CREATE TABLE IF NOT EXISTS var.order_score_options (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    score_row_id INT REFERENCES var.order_scores(row_id),
    score_rand_id TEXT,
    composition TEXT,
    value REAL
);

CREATE TABLE IF NOT EXISTS var.order_score_fact (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    name TEXT,
    description TEXT,
    score_row_id INT REFERENCES var.order_scores(row_id),
    fact_row_id INT,
    ord SMALLINT
);

CREATE TABLE IF NOT EXISTS var.order_score_variables (
    row_id BIGSERIAL PRIMARY KEY,
    rand_id TEXT,
    score_row_id INT REFERENCES var.order_scores(row_id),
    score_rand_id TEXT,
    variable_row_id INT REFERENCES var.order_variables(row_id),
    variable_rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT
);

CREATE TABLE IF NOT EXISTS var.order_items (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    name TEXT,
    description TEXT,
    value_min REAL,
    value_max REAL,
    value_default REAL
);

CREATE TABLE IF NOT EXISTS var.order_items_score_ratio (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    score_row_id INT REFERENCES var.order_scores(row_id),
    score_rand_id TEXT,
    item_row_id INT REFERENCES var.order_items(row_id),
    item_rand_id TEXT,
    value REAL
);

CREATE TABLE IF NOT EXISTS var.order_items_variable_ratio (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    variable_row_id INT REFERENCES var.order_variables(row_id),
    variable_rand_id TEXT,
    item_row_id INT REFERENCES var.order_items(row_id),
    item_rand_id TEXT,
    value REAL
);

CREATE TABLE IF NOT EXISTS var.order_auths (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    name TEXT,
    description TEXT,
    item_row_id_bigger SERIAL,
    percent REAL
);

CREATE TABLE IF NOT EXISTS var.order_auth_item (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    auth_row_id INT REFERENCES var.order_auths(row_id),
    auth_rand_id TEXT,
    item_row_id INT REFERENCES var.order_items(row_id),
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT
);

CREATE TABLE IF NOT EXISTS var.order_hokm_year_settings (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    year INT,
    yearpercent REAL
);

CREATE TABLE IF NOT EXISTS var.order_hokm_type (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    title TEXT
);

CREATE TABLE IF NOT EXISTS var.order_hokm_item (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    hokm_row_id INT REFERENCES var.order_hokm_type(row_id),
    item_row_id INT REFERENCES var.order_items(row_id),
    percent REAL
);

CREATE TABLE IF NOT EXISTS var.person_variable_values (
    row_id BIGSERIAL,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    variable_row_id INT REFERENCES var.order_variables(row_id),
    variable_rand_id TEXT,
    pr_rand_id TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    option_row_id INT REFERENCES var.order_variables_options(row_id),
    PRIMARY KEY (variable_row_id, row_id)
);

CREATE TABLE IF NOT EXISTS var.matrix_person_score_values (
    row_id BIGSERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    score_row_id INT REFERENCES var.order_scores(row_id),
    score_rand_id TEXT,
    pr_rand_id TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    value REAL
);

CREATE TABLE IF NOT EXISTS var.matrix_person_item_value (
    row_id BIGSERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    item_row_id INT REFERENCES var.order_items(row_id),
    item_rand_id TEXT,
    pr_rand_id TEXT,
    value REAL
);

CREATE TABLE IF NOT EXISTS var.order_salary (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    rev_seq SMALLINT DEFAULT 1 NOT NULL,
    status SMALLINT,
    pr_rand_id TEXT,
    affected_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    hokm_type_row_id INT REFERENCES var.order_hokm_type(row_id),
    salary_no TEXT
);

CREATE INDEX IF NOT EXISTS idx_entity_kind_name ON var.entity_kind (kind_name);
CREATE INDEX IF NOT EXISTS idx_entity_kind ON var.entity (kind_id);
CREATE INDEX IF NOT EXISTS idx_attribute_kind ON var.attribute_def (kind_id);
CREATE INDEX IF NOT EXISTS idx_attribute_entity ON var.eav (entity_id);
CREATE INDEX IF NOT EXISTS idx_order_variables_time ON var.order_variables (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_order_scores_time ON var.order_scores (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_order_items_time ON var.order_items (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_person_variable_values_time ON var.person_variable_values (start_time, end_time);
