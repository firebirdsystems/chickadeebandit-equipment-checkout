/**
 * Pure business logic for the Equipment Checkout app.
 * No DOM, no fetch — importable in both browser and test environments.
 */

export const CATEGORIES = [
  { value: "camping", label: "Camping", icon: "⛺" },
  { value: "sports",  label: "Sports",  icon: "🏀" },
  { value: "av",      label: "A/V",     icon: "📽️" },
  { value: "kitchen", label: "Kitchen", icon: "🍳" },
  { value: "tools",   label: "Tools",   icon: "🛠️" },
  { value: "other",   label: "Other",   icon: "📦" },
];

export const EQUIPMENT_STATUSES = [
  { value: "available",   label: "Available" },
  { value: "checked_out", label: "Checked out" },
  { value: "repair",      label: "In repair" },
  { value: "retired",     label: "Retired" },
];

const CAT_BY_VALUE = new Map(CATEGORIES.map((c) => [c.value, c]));

export function categoryMeta(v) {
  return CAT_BY_VALUE.get(v) ?? { value: "other", label: "Other", icon: "📦" };
}

/** The open (unreturned) checkout for an item, if any. */
export function openCheckout(checkouts, equipmentId) {
  return checkouts.find((c) => c.equipment_id === equipmentId && !c.returned_at) ?? null;
}

/** All open checkouts, most recent first. */
export function openCheckouts(checkouts) {
  return checkouts
    .filter((c) => !c.returned_at)
    .sort((a, b) => String(b.checked_out_at).localeCompare(String(a.checked_out_at)));
}

/** An item's lending history, newest first. */
export function historyFor(checkouts, equipmentId) {
  return checkouts
    .filter((c) => c.equipment_id === equipmentId)
    .sort((a, b) => String(b.checked_out_at).localeCompare(String(a.checked_out_at)));
}

function atMidnight(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/** Whole days until due (negative = overdue); null when no/invalid due date. */
export function daysUntilDue(dueDate, from = new Date()) {
  if (!dueDate) return null;
  const d = new Date(`${dueDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return Math.round((atMidnight(d) - atMidnight(from)) / 86400000);
}

/** True when an open checkout is past its due date. */
export function isOverdue(checkout, from = new Date()) {
  if (!checkout || checkout.returned_at) return false;
  const days = daysUntilDue(checkout.due_date, from);
  return days != null && days < 0;
}

/** "Due today" / "Due in 3 days" / "4 days overdue" / "". */
export function dueLabel(dueDate, from = new Date()) {
  const days = daysUntilDue(dueDate, from);
  if (days == null) return "";
  if (days < 0) return `${-days} day${days === -1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

/**
 * Inventory for the list view: available-first by category then name,
 * retired last. Each item decorated with `_open` (its open checkout).
 */
export function sortedEquipment(equipment, checkouts) {
  const rank = { available: 0, checked_out: 1, repair: 2, retired: 3 };
  return [...equipment]
    .map((e) => ({ ...e, _open: openCheckout(checkouts, e.id), _status: effectiveStatus(e, checkouts) }))
    .sort((a, b) =>
      (rank[a._status] ?? 9) - (rank[b._status] ?? 9)
      || String(a.category).localeCompare(String(b.category))
      || String(a.name).localeCompare(String(b.name)));
}

/**
 * Effective display status: the equipment.status column, but an open checkout
 * always wins (leaders keep the column synced; this heals a missed update).
 */
export function effectiveStatus(item, checkouts) {
  if (item.status === "retired" || item.status === "repair") return item.status;
  return openCheckout(checkouts, item.id) ? "checked_out" : "available";
}

/**
 * Fields the in-app search matches against (see hub-sdk `searchMatch`).
 * The asset tag / identifier is searchable because that is what is
 * physically written on the item — the fastest way to look a thing up
 * is to read its label.
 */
export function searchableFields(item) {
  return [item.name, item.category, item.identifier, item.notes, item.condition];
}
