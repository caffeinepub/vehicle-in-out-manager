# Vehicle In/Out Manager

## Current State
The app has a vehicle IN/OUT logging form with the following fields: Vehicle Number, Supplier (selectable list), Driver Name (selectable list), Units, Date (auto), Time (auto). Records are stored in backend stable storage and can be exported as CSV.

## Requested Changes (Diff)

### Add
- **Delivery Challan Number** field in the entry form: a text input where the user can type a delivery challan number for each IN/OUT entry.
- The field should appear prominently in the form (next to Units or after Driver Name).
- Challan Number should be saved per record, shown in the Vehicle Log table, and included in the CSV export.

### Modify
- `VehicleRecord` type: add `challanNumber: string` field.
- Backend `addRecord` function: add `challanNumber` parameter.
- `exportCSV`: include Challan Number column.
- Log table: add Challan Number column header and cell.
- `handleAction`: pass `challanNumber` when calling `addRecord.mutateAsync`.
- Clear `challanNumber` state after successful log.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `backend.d.ts` to add `challanNumber: string` to `VehicleRecord` and `addRecord` signature.
2. Update `src/backend/` Motoko files to add `challanNumber` field.
3. Update `App.tsx`:
   - Add `challanNumber` state variable.
   - Add Challan Number text input field in the form grid.
   - Pass `challanNumber` in `addRecord.mutateAsync` call.
   - Clear `challanNumber` after successful log.
   - Add Challan Number column to log table.
   - Update `exportCSV` to include Challan Number.
4. Update `useQueries` hook if needed to match new API signature.
