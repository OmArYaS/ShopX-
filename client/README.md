# ShopX Frontend (React + Vite + Tailwind CSS)

React frontend for the [ShopX](https://github.com/OmArYaS/ShopX-) ASP.NET Core Web API.

## Features

- Product catalog with search & add to cart
- Product details page
- Cart management (add, update quantity, remove, clear)
- Order placement & order history
- Real-time order status tracking via SignalR (`/hubs/orders`)
- Product manager (create / edit / delete products)

## Tech stack

- React 19 + Vite
- React Router 7
- Tailwind CSS v4
- Axios (API client)
- @microsoft/signalr (real-time updates)
- Lucide React (icons)
- react-hot-toast (notifications)

## Getting started

```bash
cd client
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run preview  # preview production build
```

## Connecting to the API

The API base URL defaults to `http://localhost:5062` (the ShopX ASP.NET Core API).

Override via environment variables:

```bash
# .env (create in client/)
VITE_API_BASE=http://localhost:5062
VITE_USER_ID=demo-user
```

Then run `npm run dev`. The API must be running (see the ShopX backend README) with SQL Server and migrations applied.

## Routes

| Route | Purpose |
|---|---|
| `/` | Product catalog |
| `/products/:id` | Product detail |
| `/cart` | Shopping cart + place order |
| `/orders` | Order history |
| `/orders/:id` | Order detail + live status (SignalR) |
| `/admin/products` | Product CRUD |

## Notes

- The backend has no auth; all cart/order actions use the demo user `demo-user`.
- CORS on the API allows any origin, so local development on port 5173 works out of the box.
- `node_modules` and `dist` are gitignored.
