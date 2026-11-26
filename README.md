# Ohtu Web – Lounasravintola

React/Vite-frontend ja Express-backend, tietokantana Supabase. Tarkoitus ajaa Azuressa yhtenä Node-sovelluksena: Express palvelee sekä `/api/v1` -rajapinnan että valmiiksi buildatun frontendin.

## Rakenne

```text
client/                 React-sovellus (Vite, Tailwind, react-router)
  src/components/       UI-komponentit
  src/views/            sivut
  src/hooks/            omat hookit (apiHooks.js)
  src/utils/            apufunktiot (fetchData.js)
  src/lib/              Supabase-client
server/
  src/app.js            Express-sovellus, käynnistys
  src/api/index.js      /api/v1 -pääreititin
  src/api/routes/       reitit (product, order, lunch-menu)
  src/api/controllers/  pyyntöjen käsittely
  src/api/models/       Supabase-kyselyt
  src/middlewares/      authentication, authorization, error-handlers
  src/utils/            supabase-client, http-error
```

Tiedostonimet ovat kebab-case (`lunch-menu-router.js`), samoin kuin kurssin esimerkkirepoissa.

## Asetukset

`client/.env` (julkiset arvot):

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

`server/.env`:

```text
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

Älä commitoi `.env`-tiedostoja. Service-role-avainta ei koskaan laiteta frontendiin.

## Ajaminen

```bash
npm install
npm run dev      # backend (3000) + Vite dev server, /api proxytetään backendille
npm run build    # tuottaa client/dist
npm start        # tuotanto: Express palvelee API:n ja client/dist:n
npm run lint
```

## API (`/api/v1`)

| Reitti | Kuka |
|---|---|
| `GET /health` | kaikki |
| `GET /products` | kaikki |
| `POST /products`, `PUT/DELETE /products/:id` | admin |
| `GET /lunch-menu?date=YYYY-MM-DD&category=...` | kaikki |
| `POST /lunch-menu`, `PUT/DELETE /lunch-menu/:id` | admin |
| `GET /orders`, `POST /orders` | kirjautunut käyttäjä |
| `GET /orders/admin`, `PATCH /orders/:id/status` | admin |

Autentikointi: `Authorization: Bearer <Supabase access token>`. Virheet palautuvat muodossa `{"error": {"message": "...", "status": 400}}`.

## Tilauksen teko

Klikkaa tuotteen "add to cart" → sivun alalaidassa "place order" → esim. "Order #5 placed". Tilauksen JSON näkyy devtoolsissa: Network → Fetch/XHR → `orders`.
