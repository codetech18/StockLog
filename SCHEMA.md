# StockLog — Database Schema (Supabase / Postgres)

## shops
| column | type | notes |
|---|---|---|
| id | uuid | primary key, default gen_random_uuid() |
| owner_id | uuid | references auth.users(id), not null |
| owner_name | text | |
| shop_name | text | not null |
| created_at | timestamptz | default now() |

RLS: a user can only select/insert/update rows where `owner_id = auth.uid()`.

## inventory
| column | type | notes |
|---|---|---|
| id | uuid | primary key, default gen_random_uuid() |
| shop_id | uuid | references shops(id), not null |
| device_name | text | not null |
| brand | text | required in the app form (not a DB constraint — same treatment as cost_price/selling_price) |
| imei | text | unique, **nullable** — optional for devices without one (e.g. accessories) |
| color | text | required in the app form (not a DB constraint) |
| storage | text | |
| condition | text | enum-like: 'New' \| 'UK Used' \| 'NG Used' |
| cost_price | integer | stored in whole naira |
| selling_price | integer | stored in whole naira |
| status | text | 'in_stock' \| 'sold', default 'in_stock' |
| date_of_entry | date | default current_date |
| created_at | timestamptz | default now() |

RLS: scoped by `shop_id` matching a shop owned by `auth.uid()`.
Unique constraint: `imei` column, unique across the whole table when present (catches duplicates across shops too, which matters since IMEIs are globally unique to a physical device). Postgres allows multiple `NULL`s under a unique constraint, so any number of no-IMEI devices can coexist without conflicting.

## sales
| column | type | notes |
|---|---|---|
| id | uuid | primary key, default gen_random_uuid() |
| shop_id | uuid | references shops(id), not null |
| inventory_id | uuid | references inventory(id), not null |
| buyer_name | text | nullable |
| buyer_phone | text | nullable |
| selling_price | integer | naira, captured at time of sale |
| payment_method | text | 'Cash' \| 'Transfer' |
| date_of_sale | date | default current_date |
| created_at | timestamptz | default now() |

RLS: scoped by `shop_id` matching a shop owned by `auth.uid()`.

## Relationships
- `shops` 1 → many `inventory`
- `shops` 1 → many `sales`
- `inventory` 1 → 1 `sales` (an inventory item is sold at most once; selling it updates `inventory.status` to `'sold'` and inserts a row in `sales`)

## Notes for implementation
- All money fields are integers, no decimals — never store float for currency
- `imei` is optional — only validate the 15-digit numeric format client-side when a value is actually entered; the database unique constraint is the real safety net for duplicates when it is present
- `brand` and `color` are required in the app form, but not enforced as `NOT NULL` at the DB level (consistent with how `cost_price`/`selling_price` are already handled) — adding that constraint later would need a backfill migration if any existing rows have nulls
- When recording a sale, the operation should be a single transaction: insert into `sales`, then update `inventory.status = 'sold'`
