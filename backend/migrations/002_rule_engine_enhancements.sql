-- Rule Engine Enhancements: categories, rule sets, conditions, consistent active filtering

CREATE TABLE IF NOT EXISTS var.order_rule_sets (
    row_id SERIAL PRIMARY KEY,
    rand_id TEXT,
    cr TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    up TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    name TEXT UNIQUE,
    description TEXT
);

-- Add optional category and rule_set to variables and scores; add condition to scores
ALTER TABLE var.order_variables
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS rule_set_row_id INT REFERENCES var.order_rule_sets(row_id);

ALTER TABLE var.order_scores
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS rule_set_row_id INT REFERENCES var.order_rule_sets(row_id),
    ADD COLUMN IF NOT EXISTS condition TEXT;

-- Indexes for faster selection
CREATE INDEX IF NOT EXISTS idx_order_scores_status_time ON var.order_scores (status, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_order_scores_category ON var.order_scores (category);
CREATE INDEX IF NOT EXISTS idx_order_scores_set ON var.order_scores (rule_set_row_id);

