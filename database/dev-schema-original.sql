-- dev-schema-original.sql
-- Runnable copy of the ORIGINAL production structure (before any fixes), for a
-- fresh and empty Supabase DEV project. Use it to rehearse
-- migrations/001-fix-orders-and-users.sql before touching production.
--
-- How to use: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- Then run the checks and the migration (first with rollback; at the end).
--
-- Known weak spots are kept on purpose so the migration has something to fix:
--   * ORDERS.order_status is bigint
--   * USERS/ADDRESSES/PRODUCTS columns default to the text 'NOT NULL'
--   * USERS.role is unrestricted, USERS.auth_user_id may be NULL
--
-- No Row Level Security (not enabled in the dev project). Fine for testing,
-- not for production.
--
-- Auth users cannot be copied between projects. To get USERS/ORDERS rows
-- for testing: register through the app (or Authentication -> Users -> Add
-- user), then run the optional block at the bottom.

begin;

create table public."USERS" (
  user_id bigint generated always as identity primary key,
  username varchar not null default 'NOT NULL',
  email varchar not null default 'NOT NULL' unique,
  name varchar not null default 'NOT NULL',
  role varchar not null default 'customer',
  auth_user_id uuid unique references auth.users(id)
);

create table public."ADDRESSES" (
  id bigint generated always as identity primary key,
  address varchar not null default 'NOT NULL',
  "postal code" varchar not null default 'NOT NULL',
  city varchar not null default 'NOT NULL',
  country varchar not null default 'NOT NULL',
  user_id bigint references public."USERS"(user_id)
);

create table public."PRODUCTS" (
  product_id bigint generated always as identity primary key,
  name varchar not null default 'NOT NULL',
  description text,
  price numeric not null,
  category varchar not null,
  veg boolean not null,
  glut boolean not null,
  lacto boolean not null,
  image_url text
);

create table public."LUNCH MENU" (
  product_id bigint generated always as identity primary key,
  name varchar not null,
  price numeric not null,
  category varchar not null,
  "Veg" boolean not null,
  "Glut" boolean not null,
  "Lacto" boolean not null,
  date date not null
);

create table public."RESTAURANT" (
  id bigint generated always as identity primary key,
  day_of_week smallint not null,
  "open" time without time zone not null,
  "close" time without time zone not null,
  is_closed boolean not null
);

create table public."ORDERS" (
  order_id bigint generated always as identity primary key,
  user_id bigint not null references public."USERS"(user_id),
  date date not null,
  order_detail text,
  order_status bigint
);

-- ------------------------------------------------------------ sample data
insert into public."PRODUCTS"
  (name, description, price, category, veg, glut, lacto, image_url)
values
  ('Margherita', 'Tomato, mozzarella, basil', 10.50, 'Pizza', true, false, false, null),
  ('Pepperoni', 'Tomato, mozzarella, pepperoni', 12.00, 'Pizza', false, false, false, null),
  ('Caesar salad', 'Chicken, parmesan, croutons', 9.50, 'Salad', false, false, false, null),
  ('Cola 0.33 l', null, 2.50, 'Drinks', true, true, true, null);

insert into public."LUNCH MENU"
  (name, price, category, "Veg", "Glut", "Lacto", date)
values
  ('Vegetable soup', 9.90, 'Soup', true, true, true, current_date),
  ('Meatballs and mash', 11.90, 'Main', false, false, false, current_date),
  ('Salmon soup', 10.50, 'Soup', false, true, false, current_date + 1),
  ('Lentil stew', 10.90, 'Main', true, true, true, current_date + 1);

-- day_of_week: 1 = Monday ... 7 = Sunday
insert into public."RESTAURANT" (day_of_week, "open", "close", is_closed)
values
  (1, '10:00', '21:00', false),
  (2, '10:00', '21:00', false),
  (3, '10:00', '21:00', false),
  (4, '10:00', '21:00', false),
  (5, '10:00', '22:00', false),
  (6, '12:00', '22:00', false),
  (7, '12:00', '18:00', true);

-- ----------------------------------------------------------------- grants
-- The dev project was created without "Grant API access to new tables
-- automatically", so give the API roles access to the tables above.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

commit;

-- ------------------------------------------------------------------------
-- OPTIONAL, run separately after you have created a user in Authentication.
-- Gives you a USERS row, an admin role and two orders with old-style numeric
-- statuses, so you can see what the migration does to them.
-- Replace the email first.
--
-- insert into public."USERS" (username, email, name, role, auth_user_id)
-- select 'admin', email, 'Admin', 'admin', id
-- from auth.users where email = 'you@example.com';
--
-- insert into public."ORDERS" (user_id, date, order_detail, order_status)
-- select user_id, current_date,
--        '{"items":[{"product_id":1,"name":"Margherita","quantity":2}],"total":21}',
--        s
-- from public."USERS", (values (1), (2)) as t(s)
-- where email = 'you@example.com';
