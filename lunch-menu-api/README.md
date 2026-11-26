# Lunch Menu API

The API is a standalone Express application. It listens on port `3001` by
default and exposes menu endpoints below `/api/lunch-menu`.

## Install

Run from this folder:

```bash
npm run install:app
copy .env.sample src/.env
```

Set `SUPABASE_URL` and `SUPABASE_KEY` in `src/.env`.

## Run locally

```bash
npm start
```

Endpoints:

- `GET /api/lunch-menu`
- `GET /api/lunch-menu?date=YYYY-MM-DD&category=...`
- `POST /api/lunch-menu`
- `PUT /api/lunch-menu/:productId`
- `GET /health`

## Run with PM2 on a server

Install dependencies once, then start the API as a separate process:

```bash
npm run install:app
PORT=3001 pm2 start src/server.js --name lunch-menu-api --cwd src
pm2 save
```

Create `src/.env` before starting it. Apache routes `/api/lunch-menu` to port
`3001`; the existing main application remains on port `3000`.
