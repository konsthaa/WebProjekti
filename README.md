# Ohtu Web

This project has a React/Vite frontend and an Express API that uses Supabase.

## Project structure

```text
server/        Express API, Supabase setup, routes and services
client/        Vite app, HTML entry point, React source and build output
package.json   Shared scripts and dependencies
```

## Configuration

Create `client/.env` with the public Supabase settings:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Create `server/.env` with the server-side settings:

```text
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

Do not commit `.env` files. Never put a Supabase service-role key in the frontend.

## Run locally

Install dependencies from the repository root with `npm install`, then start both the API and frontend:

```bash
npm run dev
```

The Vite development server proxies `/api` requests to the Express API on port 3000.

Create a production frontend build with:

```bash
npm run build
```


### File locations: server = Backend, client = Frontend
