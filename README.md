# SABONA

SABONA is a React/Vite storefront with an Express API, PostgreSQL, and Supabase
Storage.

## Local setup

1. Copy `front/.env.example` to `front/.env`; its default API origin is for
   local development.
2. Copy `server/.env.example` to `server/.env` and set the database, Supabase,
   and JWT values. Use a random JWT secret of at least 32 characters. The
   example uses local development mode and allows `http://localhost:5173`.
3. Install dependencies and run the frontend and API from their respective
   directories with `npm install` and `npm run dev` / `npm start`.

The API expects the PostgreSQL tables used by its controllers to already exist.
Database migrations/schema files are not included in this repository.

## Production checklist

- Set `NODE_ENV=production`, `CLIENT_ORIGINS` to the exact comma-separated
  storefront origins, and a unique JWT secret of at least 32 characters.
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `DATABASE_URL` only in the server
  environment; never put them in frontend variables.
- Configure the Supabase Storage bucket and policies for public product-image
  reads. Upload writes go through the authenticated admin API.
- Deploy the frontend with its production `VITE_API_URL` and serve it over HTTPS.
- Verify the database schema, backups, environment values, and API connectivity
  in the deployment environment before accepting orders.
