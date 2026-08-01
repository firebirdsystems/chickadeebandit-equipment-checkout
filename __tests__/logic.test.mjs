import { describe, it, expect } from "vitest";
import {
  categoryMeta, openCheckout, openCheckouts, historyFor, daysUntilDue,
  isOverdue, dueLabel, sortedEquipment, effectiveStatus, searchableFields,
} from "../src/logic.js";

const FROM = new Date(2026, 6, 12, 9, 0, 0); // July 12, 2026 local

const checkouts = [
  { id: "c1", equipment_id: "eq1", member_id: "m1", due_date: "2026-07-10", checked_out_at: "2026-07-01T10:00:00Z", returned_at: null },
  { id: "c2", equipment_id: "eq1", member_id: "m2", due_date: "", checked_out_at: "2026-06-01T10:00:00Z", returned_at: "2026-06-08T10:00:00Z" },
  { id: "c3", equipment_id: "eq2", member_id: "m2", due_date: "2026-07-20", checked_out_at: "2026-07-05T10:00:00Z", returned_at: null },
];

describe("openCheckout / openCheckouts / historyFor", () => {
  it("finds the unreturned checkout per item", () => {
    expect(openCheckout(checkouts, "eq1")?.id).toBe("c1");
    expect(openCheckout(checkouts, "eq3")).toBeNull();
  });
  it("lists all open checkouts newest first", () => {
    expect(openCheckouts(checkouts).map((c) => c.id)).toEqual(["c3", "c1"]);
  });
  it("history is newest first including returned", () => {
    expect(historyFor(checkouts, "eq1").map((c) => c.id)).toEqual(["c1", "c2"]);
  });
});

describe("due dates", () => {
  it("computes days until due and overdue state", () => {
    expect(daysUntilDue("2026-07-10", FROM)).toBe(-2);
    expect(daysUntilDue("", FROM)).toBeNull();
    expect(isOverdue(checkouts[0], FROM)).toBe(true);
    expect(isOverdue(checkouts[2], FROM)).toBe(false);
    expect(isOverdue({ ...checkouts[0], returned_at: "2026-07-11T00:00:00Z" }, FROM)).toBe(false);
  });
  it("labels due dates", () => {
    expect(dueLabel("2026-07-12", FROM)).toBe("Due today");
    expect(dueLabel("2026-07-13", FROM)).toBe("Due tomorrow");
    expect(dueLabel("2026-07-15", FROM)).toBe("Due in 3 days");
    expect(dueLabel("2026-07-10", FROM)).toBe("2 days overdue");
    expect(dueLabel("", FROM)).toBe("");
  });
});

describe("sortedEquipment / effectiveStatus", () => {
  const equipment = [
    { id: "eq1", name: "Tent", category: "camping", status: "checked_out" },
    { id: "eq2", name: "Stove", category: "camping", status: "available" }, // has an open checkout — status drifted
    { id: "eq4", name: "Old banner", category: "other", status: "retired" },
    { id: "eq3", name: "Ball", category: "sports", status: "available" },
  ];
  it("effectiveStatus heals a drifted status column from open checkouts", () => {
    expect(effectiveStatus(equipment[1], checkouts)).toBe("checked_out");
    expect(effectiveStatus(equipment[0], checkouts)).toBe("checked_out");
    expect(effectiveStatus({ id: "eq3", status: "available" }, checkouts)).toBe("available");
    expect(effectiveStatus({ id: "eq3", status: "retired" }, checkouts)).toBe("retired");
  });
  it("sorts available first, retired last, and decorates _open", () => {
    const list = sortedEquipment(equipment, checkouts);
    expect(list.map((e) => e.id)).toEqual(["eq3", "eq2", "eq1", "eq4"]);
    expect(list.find((e) => e.id === "eq1")._open?.id).toBe("c1");
  });
});

describe("categoryMeta", () => {
  it("falls back to other", () => expect(categoryMeta("bogus").value).toBe("other"));
});

describe("searchableFields", () => {
  it("matches on the asset identifier written on the item itself", () => {
    const fields = searchableFields({
      name: "Folding table", category: "furniture", identifier: "TBL-014",
      notes: "wobbly leg", condition: "fair",
    });
    expect(fields).toContain("TBL-014");
    expect(fields).toContain("wobbly leg");
  });
});
