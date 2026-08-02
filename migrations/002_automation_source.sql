-- Automation support for the `add_equipment` action.
--
-- `source_event_id` records which app event produced the row. The dispatcher's
-- dedupe guard matches on it (SELECT 1 FROM ... WHERE source_event_id = ?
-- LIMIT 1), so a redelivered event reuses the equipment record that already
-- exists rather than creating a duplicate asset.
--
-- Nullable on purpose: equipment entered by hand has no source event, and the
-- guard only ever looks for a specific non-null id.
ALTER TABLE app_equipment_checkout__equipment ADD COLUMN source_event_id TEXT;

CREATE INDEX IF NOT EXISTS app_equipment_checkout__idx_equipment_source_event_id
  ON app_equipment_checkout__equipment(source_event_id);
