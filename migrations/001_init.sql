-- Equipment Checkout — org-owned gear inventory + lending ledger.
--
-- This is deliberately a *leader-recorded* ledger, not member self-checkout:
-- both tables are `adult_writable` (manifest.json) — every member can see the
-- inventory and who has what, only adults (quartermasters) record checkouts
-- and returns. That keeps the flow simple and avoids the capacity-race
-- machinery (`slot_claims`) that self-service would require; the "capacity"
-- of a single item is enforced by the app only writing one open checkout per
-- item, and an incorrect double-record is a leader error correctable in the
-- same UI. (Distinct from the `borrowing` app, which is peer-to-peer lending
-- between members with mutual agreement.)
--
-- A checkout row with returned_at IS NULL is the item's current holder;
-- returning stamps returned_at, preserving history.
--
-- `due_date` is declared plaintext (manifest db_plaintext_columns) for the
-- overdue export; `status` (available|checked_out|repair|retired) is a hub
-- built-in plaintext column. Names/identifiers/notes stay encrypted at rest.
CREATE TABLE IF NOT EXISTS app_equipment_checkout__equipment (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,                     -- "6-person tent #2"
  category   TEXT NOT NULL DEFAULT 'other',     -- camping|sports|av|kitchen|tools|other
  identifier TEXT NOT NULL DEFAULT '',          -- asset tag / serial
  condition  TEXT NOT NULL DEFAULT 'good',      -- good|fair|needs-repair (display only)
  status     TEXT NOT NULL DEFAULT 'available', -- available|checked_out|repair|retired
  notes      TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_equipment_checkout__checkouts (
  id             TEXT PRIMARY KEY,
  equipment_id   TEXT NOT NULL,
  member_id      TEXT NOT NULL,                 -- who has the item
  due_date       TEXT NOT NULL DEFAULT '',      -- ISO YYYY-MM-DD ('' = no due date)
  checked_out_at TEXT NOT NULL,
  returned_at    TEXT,                          -- NULL = still out
  notes          TEXT NOT NULL DEFAULT '',
  recorded_by    TEXT NOT NULL,                 -- the leader who recorded it
  created_at     TEXT NOT NULL,
  FOREIGN KEY (equipment_id) REFERENCES app_equipment_checkout__equipment(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS app_equipment_checkout__checkouts_equipment_idx
  ON app_equipment_checkout__checkouts (equipment_id, checked_out_at);

CREATE INDEX IF NOT EXISTS app_equipment_checkout__checkouts_member_idx
  ON app_equipment_checkout__checkouts (member_id, returned_at);
