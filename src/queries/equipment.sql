-- AI read export: the gear inventory.
-- adult_writable reads are open, so no member_id is required.
-- status is the hub built-in plaintext column.
SELECT
  id,
  name,
  category,
  identifier,
  condition,
  status,
  notes
FROM app_equipment_checkout__equipment
ORDER BY status, category
LIMIT 500
