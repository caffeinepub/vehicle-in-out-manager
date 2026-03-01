# Vehicle In/Out Time Management System

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Vehicle entry/exit log system
- Vehicle number selection via dropdown tag (predefined list + custom entry)
- Auto-capture current date and time on log entry
- "Vehicle IN" and "Vehicle OUT" actions
- Table view of all logged records (vehicle number, type (IN/OUT), date, time)
- CSV export button to download all records as a .csv file
- Ability to delete individual records

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- `addRecord(vehicleNumber: Text, action: Text, date: Text, time: Text)` -> Record ID
- `getRecords()` -> list of all records with id, vehicleNumber, action, date, time
- `deleteRecord(id: Nat)` -> Bool
- Store records in stable memory (array/map)

### Frontend (React)
- Header with app title
- Vehicle number selector: dropdown with common vehicle tags + option to type a custom number
- Action buttons: "Vehicle IN" (green) and "Vehicle OUT" (red)
- Records table: columns for #, Vehicle Number, Action, Date, Time, Delete
- CSV Export button: generates and downloads CSV from current records
- Auto-fills current date and time when logging
