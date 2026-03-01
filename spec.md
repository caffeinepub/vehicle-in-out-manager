# Vehicle In/Out Manager

## Current State
- Login screen with hardcoded single admin account (username: admin, password: admin123)
- After login, users can select/add vehicle numbers, log IN/OUT events with timestamp
- All records stored in backend canister
- CSV export available

## Requested Changes (Diff)

### Add
- Admin can create up to 3 additional user accounts (username + password) from a "Manage Users" panel
- Created users are stored in localStorage and can log in with their credentials
- Admin sees a user management section (accessible only when logged in as admin)
- Max 3 user slots; UI shows how many slots are used (e.g. "2/3 users")

### Modify
- Login screen now validates against both the hardcoded admin account AND any user accounts stored in localStorage
- Admin panel shows a "Manage Users" tab or section post-login

### Remove
- Nothing removed

## Implementation Plan
1. Add a `LS_USERS_KEY` localStorage key to store created user accounts (array of {username, password})
2. Update login validation to check both admin credentials and stored users
3. Add a "Manage Users" section visible only when logged in as admin (tracked via a `currentUser` state instead of just boolean)
4. In Manage Users: list existing users, allow adding up to 3 (username + password form), allow deleting users
5. Show user count indicator (e.g. "1/3 users created")
