-- EAV Enhancements for dynamic attribute metadata and history support

ALTER TABLE var.attribute_def
    ADD COLUMN IF NOT EXISTS display_name TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS default_value JSONB,
    ADD COLUMN IF NOT EXISTS validation_rules JSONB,
    ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS is_editable BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS depends_on_attribute_id INT REFERENCES var.attribute_def(row_id),
    ADD COLUMN IF NOT EXISTS depends_on_value JSONB;

ALTER TABLE var.attribute_def
    DROP CONSTRAINT IF EXISTS attribute_def_data_type_check;

ALTER TABLE var.attribute_def
    ADD CONSTRAINT attribute_def_data_type_check CHECK (data_type IN ('string', 'real', 'date', 'bool', 'json'));

CREATE INDEX IF NOT EXISTS idx_attribute_def_category ON var.attribute_def (category);
CREATE INDEX IF NOT EXISTS idx_attribute_def_visibility ON var.attribute_def (is_visible, is_editable);

ALTER TABLE var.eav
    ADD COLUMN IF NOT EXISTS value_json JSONB,
    ADD COLUMN IF NOT EXISTS created_by TEXT,
    ADD COLUMN IF NOT EXISTS updated_by TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS var.attribute_dependencies (
    row_id SERIAL PRIMARY KEY,
    attribute_id INT NOT NULL REFERENCES var.attribute_def(row_id) ON DELETE CASCADE,
    depends_on_attribute_id INT NOT NULL REFERENCES var.attribute_def(row_id) ON DELETE CASCADE,
    condition JSONB,
    UNIQUE (attribute_id, depends_on_attribute_id)
);

CREATE TABLE IF NOT EXISTS var.attribute_change_log (
    row_id BIGSERIAL PRIMARY KEY,
    attribute_id INT NOT NULL REFERENCES var.attribute_def(row_id),
    entity_id INT NOT NULL REFERENCES var.entity(row_id),
    old_value JSONB,
    new_value JSONB,
    changed_by TEXT,
    changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attribute_change_log_attr ON var.attribute_change_log (attribute_id);
CREATE INDEX IF NOT EXISTS idx_attribute_change_log_entity ON var.attribute_change_log (entity_id, changed_at DESC);
