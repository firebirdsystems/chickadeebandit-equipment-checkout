-- Index the manifest `preload` read, which the hub runs server-side while
-- rendering this app's document — on every launch, for every household.
--
-- Both preload reads sorted their whole table under a LIMIT. checkouts is the
-- one that matters: it grows with every loan ever made, and the preload asks
-- for the most recent 2,000 of them.
CREATE INDEX IF NOT EXISTS app_equipment_checkout__equipment_created_idx
  ON app_equipment_checkout__equipment (created_at ASC);
CREATE INDEX IF NOT EXISTS app_equipment_checkout__checkouts_out_idx
  ON app_equipment_checkout__checkouts (checked_out_at DESC);
