# Vendor Dashboard Testing Guide

## Backend API Status: ✅ FULLY FUNCTIONAL
All vendor API endpoints have been tested and work correctly:
- GET /api/vendor/my-truck
- GET /api/vendor/my-truck/menu  
- POST /api/vendor/my-truck/menu
- PATCH /api/vendor/my-truck/menu/:itemId
- DELETE /api/vendor/my-truck/menu/:itemId
- PUT /api/vendor/my-truck/busy-mode

## Frontend Fixes Applied
1. **Removed image field** - Database schema doesn't support it
2. **Fixed busy mode toggle** - Now uses 'unavailable'/'available' correctly
3. **Added busy state loading** - Checkbox reflects current truck status
4. **Fixed form data** - No longer sends undefined fields

## How to Test

### 1. Start the Server
```powershell
cd 'C:\Users\hassa\OneDrive\Desktop\GIU\git\Order-management-system'
npm start
```

### 2. Test Vendor Login
1. Go to http://localhost:5000/login.html
2. Use vendor credentials:
   - **Email**: `demeshq.vendor@giu-uni.de`
   - **Password**: [your vendor password]
3. Should redirect to `/vendor-dashboard.html`

### 3. Test Menu Item Management
1. Click "Add Menu Item" button
2. Fill in:
   - Name: Test Dish
   - Description: Delicious test item
   - Price: 25.00
   - Available: checked
3. Click "Save Item"
4. Should see success message
5. Verify in database:
```javascript
node -e "const db = require('./backend/config/db'); (async () => { const items = await db('foodtruck.menuitems').where({truckid: 1}).orderBy('createdat', 'desc').limit(1); console.log(items); await db.destroy(); })()"
```

### 4. Test Busy Mode Toggle
1. Find "Busy Mode" checkbox in settings
2. Toggle it on
3. Should see alert message
4. Verify in database:
```javascript
node -e "const db = require('./backend/config/db'); (async () => { const truck = await db('foodtruck.trucks').where({truckid: 1}).first(); console.log('Status:', truck.truckstatus); await db.destroy(); })()"
```
5. Refresh page - checkbox should maintain state

### 5. Test Edit Menu Item
1. Find any menu item in the list
2. Click edit icon
3. Change price to 30.00
4. Click "Save Item"
5. Should update successfully

### 6. Test Delete Menu Item
1. Find the test item you created
2. Click delete/trash icon
3. Confirm deletion
4. Item should disappear from list

## Available Test Vendor Accounts
1. Ahmed Hassan - demeshq.vendor@giu-uni.de (Demeshq truck)
2. Mohamed Ali - container.vendor@giu-uni.de (Container truck)
3. Fatma Ibrahim - essens.vendor@giu-uni.de (Essens truck)
4. Sara Mohamed - ftarwasha.vendor@giu-uni.de (Ftar w Asha truck)
5. Omar Khaled - loaded.vendor@giu-uni.de (Loaded truck)

## Troubleshooting

### If API calls fail:
1. Check browser console (F12) for errors
2. Verify token is present: `localStorage.getItem('token')`
3. Check server logs for errors
4. Verify you're logged in as 'truckOwner' role, not 'customer'

### If busy mode doesn't work:
1. Check current status: The truck status should be 'unavailable' when busy
2. Verify checkbox reflects database state on page load
3. Check for CORS errors in console

### If menu items don't appear:
1. Verify you have a truck assigned (check my-truck endpoint)
2. Check if menu items exist for your truck in database
3. Look for JavaScript errors in console

## Database Quick Checks

### Check if vendor has a truck:
```javascript
node -e "const db = require('./backend/config/db'); (async () => { const truck = await db('foodtruck.trucks').where({ownerid: 1}).first(); console.log(truck); await db.destroy(); })()"
```

### Check menu items for truck:
```javascript
node -e "const db = require('./backend/config/db'); (async () => { const items = await db('foodtruck.menuitems').where({truckid: 1}); console.log('Count:', items.length); await db.destroy(); })()"
```

### Reset truck status:
```javascript
node -e "const db = require('./backend/config/db'); (async () => { await db('foodtruck.trucks').where({truckid: 1}).update({truckstatus: 'available'}); console.log('Reset to available'); await db.destroy(); })()"
```
