# Parapharmacie

Monorepo local for the AtlasPara store. Each application has its own `package.json` and `package-lock.json`. The package manager is npm. Node.js 20 is the version used in CI.

| Directory | Role |
| --- | --- |
| `Frontend` | React 19, Vite 8, Tailwind 4 storefront and admin/livreur screens |
| `Backend` | Express 5 API, Prisma 6, PostgreSQL |
| `Mobile` | Expo application, not included in CI |

## Local setup

```bash
cd Backend
copy .env.example .env
npm ci
npx prisma migrate dev
npm run dev
```

```bash
cd Frontend
copy .env.example .env
npm ci
npm run dev
```

The API listens on port 5000. Vite proxies `/api` and `/uploads` to that port during development. Fill the copied `.env` files locally. Those files stay out of Git.

## Environment variables

Names only. Put real values in the ignored `.env` files, never in the examples.

Backend: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `GOOGLE_CLIENT_ID`.

Seed, development only: `SEED_ADMIN_PASSWORD`, `SEED_CLIENT_PASSWORD`, `SEED_LIVREUR_PASSWORD`.

Frontend: `VITE_GOOGLE_CLIENT_ID`, `VITE_API_URL`.

## Database

From `Backend`, with `DATABASE_URL` pointing at your local PostgreSQL database:

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

`prisma db seed` loads passwords from `Backend/.env` and exits before using them when `NODE_ENV=production`. It does not run on server start. Do not point these commands at a production database.

## Checks

Frontend:

```bash
npm ci
npm run lint
npm run build
```

There is no frontend test script.

Backend:

```bash
npm ci
npx prisma validate
npx prisma generate
```

There is no backend lint or test script. `prisma validate` checks the schema. It does not open a database connection. `prisma generate` writes the client into `node_modules`.

## Continuous integration

`.github/workflows/ci.yml` runs on pushes and pull requests to `main` and `mustapha`.

- Frontend job: `npm ci`, `npm run lint`, `npm run build`, with placeholder `VITE_*` values.
- Backend job: `npm ci`, `npx prisma validate`, `npx prisma generate`, with a dummy `DATABASE_URL` on `127.0.0.1` that is never a real database.

The workflow does not deploy and does not print secrets.
