-- equipment orders by (status, category) under LIMIT 500; both are hub built-in
-- plaintext columns.
CREATE INDEX IF NOT EXISTS app_equipment_checkout__equipment_status_category_idx
  ON app_equipment_checkout__equipment(status, category);

-- open_checkouts seeks returned_at IS NULL — which SQLite can serve from an
-- index — and orders by due_date. The existing (member_id, returned_at) index
-- does not lead on returned_at, so the unfiltered read could not use it.
CREATE INDEX IF NOT EXISTS app_equipment_checkout__checkouts_returned_due_idx
  ON app_equipment_checkout__checkouts(returned_at, due_date);
