-- AI read export: items currently out (returned_at not yet stamped).
-- due_date is declared in db_plaintext_columns so the ORDER BY works;
-- checked_out_at/returned_at are _at-suffixed and already plaintext.
SELECT
  id,
  equipment_id,
  member_id,
  due_date,
  checked_out_at,
  notes
FROM app_equipment_checkout__checkouts
WHERE returned_at IS NULL
ORDER BY (due_date = ''), due_date
LIMIT 300
