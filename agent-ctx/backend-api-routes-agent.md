# Task: Wire Up Database and Create API Routes for GigRider

## Task ID: backend-api-routes

## Summary

Successfully wired up the Prisma database and created all API routes for the GigRider delivery rider app.

## Files Created/Modified

### Schema & Database
- **`/home/z/my-project/prisma/schema.prisma`** — Updated with 8 models: Rider, RiderPlatform, Delivery, Earning, Shift, Notification, AutoAcceptRule, RiderSettings. All with proper relations, default values, and SQLite-compatible types.

### Lib Helpers
- **`/home/z/my-project/src/lib/auth.ts`** — JWT auth helper using `jose` library. Exports `getAuthUser()` function that extracts and verifies Bearer tokens from request headers.
- **`/home/z/my-project/src/lib/db.ts`** — Updated Prisma client export. Exports `prisma` as named export. Uses singleton pattern for development.

### API Routes (8 route files)

1. **`/api/auth/send-otp`** (POST) — Generates 6-digit OTP, stores with 5-min expiry, returns JWT verifyToken. Returns OTP in dev mode.
2. **`/api/auth/verify-otp`** (POST) — Verifies OTP + verifyToken, finds or creates rider with default settings, returns session JWT (7d expiry).
3. **`/api/rider`** (GET/PUT) — GET returns full rider profile with platforms, settings, auto-accept rules, and stats. PUT updates name, email, vehicleType, isOnline.
4. **`/api/deliveries`** (GET/POST) — GET returns paginated delivery history with filters (status, platform, date range). POST creates delivery and auto-creates earning records + updates rider/platform stats for completed deliveries.
5. **`/api/earnings`** (GET) — Returns earnings summary (today/week/month/all), weekly chart data, platform breakdown, source breakdown, and recent earning records.
6. **`/api/platforms`** (GET/POST/PUT/DELETE) — Full CRUD for connected platforms. Auto-creates auto-accept rules. Updates rider isOnline status when platform online status changes.
7. **`/api/notifications`** (GET/POST/PUT/DELETE) — GET with pagination + unread count. POST creates. PUT marks read (individual or all). DELETE single or clear all.
8. **`/api/settings`** (GET/PUT) — GET returns settings with parsed notifications JSON. PUT upserts settings with all configurable fields.

## Testing Results

All endpoints tested and verified working:
- ✅ Auth flow (send-otp → verify-otp → session token)
- ✅ Rider profile GET/PUT
- ✅ Delivery creation with auto-earning records
- ✅ Earnings summary with aggregations
- ✅ Platform connect/disconnect/update
- ✅ Notification CRUD
- ✅ Settings GET/PUT with JSON parsing

## Key Design Decisions
- All monetary values stored as integers in **paisa** (1/100 INR) to avoid floating point issues
- SQLite uses String type for enums (pending/accepted/picked_up/completed/cancelled)
- Notifications JSON stored as string in SQLite, parsed on read
- Auto-accept rules are per-rider-per-platform (unique constraint on riderId+platformId)
- Completed deliveries automatically update rider stats and create earning records via transaction
