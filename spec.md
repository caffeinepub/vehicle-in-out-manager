# Vehicle In/Out Manager

## Current State
Full-stack vehicle tracking app with login, vehicle/supplier/driver dropdowns, IN/OUT logging, and CSV export. The backend stores records using `Map.empty<Nat, VehicleRecord>()` which is non-stable and loses all data on canister upgrade/redeployment. The `nextId` counter is also non-stable and resets to 0, causing data loss and ID collisions.

## Requested Changes (Diff)

### Add
- Stable storage for vehicle records using `stable var` so data persists across upgrades
- `preupgrade` and `postupgrade` system hooks to preserve data

### Modify
- Change `var nextId` to `stable var nextId` so the counter persists
- Change `let records = Map.empty<Nat, VehicleRecord>()` to use a stable array-backed store that survives upgrades

### Remove
- Non-stable in-memory map that causes data loss on redeploy

## Implementation Plan
1. Regenerate backend with stable storage: `stable var nextId`, `stable var stableRecords`, `preupgrade`/`postupgrade` hooks
2. All other frontend logic remains unchanged -- no frontend changes needed
