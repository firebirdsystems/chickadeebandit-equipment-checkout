# Equipment Checkout

The club's gear closet — an inventory of org-owned equipment, who has what
checked out, due dates, and the full lending history per item.

- **Storage:** D1 (`equipment`, `checkouts`; a checkout with `returned_at`
  NULL is the current holder)
- **Access:** both tables `adult_writable` — a deliberately leader-recorded
  ledger (quartermaster marks checkouts/returns), everyone views. Member
  self-checkout would need `slot_claims`-style atomicity and was intentionally
  not built; peer-to-peer lending is the separate `borrowing` app.
- **AI:** read-only exports `equipment`, `open_checkouts`.

## Develop

```bash
make install
make dev
make test
make build
```
