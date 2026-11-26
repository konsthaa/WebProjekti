-- 001-fix-orders-and-users.sql
-- Run in the Supabase SQL editor. Runs in one transaction: if any statement
-- fails, nothing is changed.
--
-- 1. ORDERS.order_status: bigint -> text with allowed values
--    (the API sends text, so admins could not change an order's status before)
-- 2. USERS: remove the 'NOT NULL' default strings, limit role values,
--    require a link to the Supabase auth user
--
-- CHECK BEFORE running (each should return no rows / expected values):
--   -- rows that would break the new USERS constraints
--   select user_id, username, email, name, role, auth_user_id from "USERS"
--     where auth_user_id is null
--        or role is null or role not in ('customer', 'admin');
--   -- rows holding the literal default text 'NOT NULL' (fix them by hand)
--   select user_id, username, email, name from "USERS"
--     where 'NOT NULL' in (username, email, name);
--   -- which numeric status codes exist in ORDERS today
--   select order_status, count(*) from "ORDERS" group by 1;

begin;

-- ---------------------------------------------------------------- ORDERS
-- Old bigint codes have no known meaning, so every existing order becomes
-- 'pending'. If you used numeric codes, replace the 'pending' in USING with a
-- CASE, e.g.  using (case order_status when 1 then 'ready' else 'pending' end)
alter table public."ORDERS" alter column order_status drop default;

alter table public."ORDERS"
  alter column order_status type text
  using ('pending');

alter table public."ORDERS"
  alter column order_status set default 'pending',
  alter column order_status set not null,
  add constraint orders_status_check check (
    order_status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')
  );

-- ----------------------------------------------------------------- USERS
-- The defaults were the literal text 'NOT NULL', which would be saved as a
-- real value whenever a column was left out.
alter table public."USERS"
  alter column username drop default,
  alter column email drop default,
  alter column name drop default;

-- 'customer' stays the default role; anonymous visitors have no USERS row
alter table public."USERS"
  add constraint users_role_check check (role in ('customer', 'admin'));

alter table public."USERS"
  alter column auth_user_id set not null;

commit;
