# Vehicle In/Out Manager

## Current State
The app has a vehicle entry/exit logging system with:
- Vehicle number (selectable from a saved list, or typed custom)
- Supplier (selectable from a saved list)
- Units (numeric input)
- Date and Time (auto-filled)
- Login system with admin and up to 3 managed users
- Records table with CSV export
- One-vehicle-at-a-time enforcement

The `VehicleRecord` type currently has: id, action, supplier, date, vehicleNumber, time, units.
The backend `addRecord` signature: addRecord(vehicleNumber, action, date, time, supplier, units).

## Requested Changes (Diff)

### Add
- `driverName` field to VehicleRecord (stored as string)
- Driver Name selector in the entry form, working identically to Supplier: a dropdown select with a saved list (stored in localStorage), ability to add new driver names and remove existing ones
- Driver Name column in the records log table
- Driver Name included in CSV export

### Modify
- Backend `addRecord` to accept a new `driverName` parameter
- `VehicleRecord` interface to include `driverName: string`
- `exportCSV` function to include the Driver Name column
- `handleAction` to pass `driverName` when calling `addRecord.mutateAsync`
- After a successful IN/OUT log, reset the driver name field (like supplier resets)

### Remove
- Nothing removed

## Implementation Plan
1. Update Motoko backend: add `driverName` field to VehicleRecord type and `addRecord` function signature; update stable storage migration to handle the new field with empty string default for old records.
2. Update `backend.d.ts` to reflect new `driverName: string` in VehicleRecord and updated `addRecord` signature.
3. In App.tsx frontend:
   - Add localStorage key and load/save functions for driver names (LS_DRIVER_KEY)
   - Add state: `driverName`, `customDrivers`, `newDriverInput`
   - Add handlers: `handleAddDriver`, `handleRemoveDriver`
   - Add Driver Name field in the form (between Supplier and Units), identical pattern to Supplier selector
   - Pass `driverName` to `addRecord.mutateAsync` and reset after success
   - Add Driver Name column to the records table
   - Add Driver Name to CSV export header and rows
4. Update `useQueries` hook if needed to pass driverName parameter.
