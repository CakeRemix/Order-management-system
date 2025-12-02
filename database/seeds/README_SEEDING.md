# Database Seeding Guide

## Public Schema Seeds - Complete Data

The following seed files populate the `public` schema with comprehensive sample data including ALL fields.

### Available Seed Files

1. **seed_trucks_public.sql** - Seeds 5 food trucks with complete information
2. **seed_menu_items_public.sql** - Seeds 25 menu items (5 per truck) with full details

### Complete Fields Included

#### Food Trucks
- ✅ **id** - Auto-generated primary key
- ✅ **name** - Truck name
- ✅ **description** - Detailed description (2-3 sentences)
- ✅ **location** - Specific campus location
- ✅ **image_url** - Logo/image path
- ✅ **vendor_id** - NULL (can be linked to users later)
- ✅ **status** - 'open' (enum: open/busy/closed)
- ✅ **is_busy** - false
- ✅ **busy_until** - NULL
- ✅ **operating_hours** - JSON with daily hours
- ✅ **prep_time_minutes** - Preparation time (12-20 mins)
- ✅ **is_active** - true
- ✅ **created_at** - Auto timestamp
- ✅ **updated_at** - Auto timestamp

#### Menu Items
- ✅ **id** - Auto-generated primary key
- ✅ **food_truck_id** - Foreign key to trucks
- ✅ **name** - Item name
- ✅ **description** - Detailed description
- ✅ **price** - Price in EGP (10-75)
- ✅ **image_url** - Item image path
- ✅ **category** - Category (Wraps, Bowls, etc.)
- ✅ **prep_time_minutes** - Prep time (3-20 mins)
- ✅ **is_available** - true
- ✅ **is_active** - true
- ✅ **stock_quantity** - Available stock (30-100)
- ✅ **calories** - Calorie count
- ✅ **allergens** - Array of allergen strings
- ✅ **created_at** - Auto timestamp
- ✅ **updated_at** - Auto timestamp

### How to Run Seeds

#### Using Node.js (Recommended)

```bash
# Seed food trucks (with ALL fields)
node -e "const db = require('./backend/config/db'); const fs = require('fs'); (async () => { const sql = fs.readFileSync('./database/seeds/seed_trucks_public.sql', 'utf8'); await db.raw(sql); console.log('Trucks seeded!'); await db.destroy(); })()"

# Seed menu items (with ALL fields)
node -e "const db = require('./backend/config/db'); const fs = require('fs'); (async () => { const sql = fs.readFileSync('./database/seeds/seed_menu_items_public.sql', 'utf8'); await db.raw(sql); console.log('Menu items seeded!'); await db.destroy(); })()"
```

#### Using PostgreSQL Client

```bash
psql -U your_username -d your_database -f database/seeds/seed_trucks_public.sql
psql -U your_username -d your_database -f database/seeds/seed_menu_items_public.sql
```

### Seeded Data Details

#### Food Trucks (5)

1. **Demeshq** - Syrian cuisine
   - Location: Main Campus Plaza, Building A
   - Hours: Mon-Thu 9AM-6PM, Fri 9AM-3PM
   - Prep time: 15 mins

2. **Container** - Healthy options
   - Location: Engineering Building, Gate 2
   - Hours: Mon-Thu 8AM-5PM, Fri 8AM-2PM
   - Prep time: 20 mins

3. **Essens** - Sandwiches and wraps
   - Location: Library Courtyard, Ground Floor
   - Hours: Mon-Fri 8:30AM-7PM, Sat 10AM-3PM
   - Prep time: 12 mins

4. **Ftar w Asha** - Egyptian food
   - Location: Student Center, Main Entrance
   - Hours: Mon-Thu 7AM-8PM, Fri 7AM-3PM, Sat 8AM-2PM
   - Prep time: 18 mins

5. **Loaded** - Fast food
   - Location: Sports Complex, Near Football Field
   - Hours: Daily 11AM-9PM (extended on weekends)
   - Prep time: 15 mins

#### Menu Items (25 total - 5 per truck)

Each menu item includes:
- Detailed descriptions
- Calorie information
- Allergen warnings (gluten, dairy, nuts, etc.)
- Stock quantities (30-100 units)
- Prep times (3-20 minutes)
- Realistic pricing (10-75 EGP)

### Notes

- These seeds use `TRUNCATE CASCADE` which will clear existing data
- Sequence counters are reset to start from 1
- All trucks have realistic operating hours in JSONB format
- All items include comprehensive allergen information
- Stock quantities allow for inventory tracking
- Calorie information supports dietary requirements
- All data is production-ready and complete
