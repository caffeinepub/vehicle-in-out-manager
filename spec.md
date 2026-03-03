# Vehicle In/Out Manager

## Current State
The app has a login screen, vehicle/supplier/driver dropdowns, a form to log IN/OUT records with units and challan number, a records table, and Excel export. The backend uses stable Motoko arrays. The frontend calls `actor.addRecord(...)` via `useAddRecord` mutation hook. When the backend call throws, the catch block shows "Failed to log vehicle."

## Requested Changes (Diff)

### Add
- Better error messaging: show the actual error message from the backend in the toast instead of a generic string.
- A loading/not-ready guard: if actor is null when user clicks IN/OUT, show "System loading, please wait a moment and try again."
- Auto-retry logic: if actor is loading, wait up to 3 seconds and retry once.

### Modify
- `handleAction` in App.tsx: catch and display the real error message, add actor-null guard with friendly message.
- `useAddRecord` in useQueries.ts: pass through the actual error so it bubbles up properly.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `handleAction` in App.tsx to show the real error (`err instanceof Error ? err.message : "Unknown error"`) in the toast.
2. Add a guard: if `addRecord` is called but `actor` is not available, show a "System is loading, please try again in a moment" message.
3. Fix the catch message to be descriptive and helpful.
