# Runly

Runly je web aplikacija za organizaciju grupnih treninga trcanja sa:
- autentikacijom i pristupom preko sesija
- kreiranjem/pretragom/prijavom/odjavom sa treninga
- chat-om za ucesnike treninga
- ocenjivanjem kreatora treninga
- admin alatima za moderaciju
- pregledom statistike i map filterima

## Tehnologije
- Next.js (App Router) + React + TypeScript
- PostgreSQL
- Drizzle ORM + Drizzle Kit migracije
- Vitest za automatizovane testove

## Preduslovi
- Node.js 20+
- npm 10+
- PostgreSQL 16+ (ili Docker)

## Promenljive okruzenja
Kreiraj `.env.local` fajl u root direktorijumu projekta:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/runly
NEXT_PUBLIC_APP_NAME=Runly
```

## Lokalno pokretanje
```bash
npm install
npm run db:push
npm run dev
```

Aplikacija: `http://localhost:3000`

## Docker
Pokretanje aplikacije i baze preko Docker Compose:

```bash
docker compose up --build
```

Podrazumevani portovi:
- aplikacija: `3000`
- postgres: `5432`

## Korisne skripte
```bash
npm run lint
npm run test
npm run build
npm run db:generate
npm run db:push
npm run db:studio
npm run db:seed:admin
```

## API dokumentacija (Swagger/OpenAPI)
- OpenAPI specifikacija: `public/openapi.yaml`
- Swagger UI stranica: `http://localhost:3000/docs`

Swagger UI se ucitava sa `/swagger.html` i prikazuje lokalnu OpenAPI specifikaciju.

## Glavni API moduli
- Auth: `/api/auth/*`
- Profile: `/api/profile/me`
- Runs: `/api/runs*`
- Chat: `/api/chat/*`
- Ratings: `/api/ratings*`, `/api/users/:id/ratings`
- Dashboard: `/api/dashboard/me`
- Admin: `/api/admin/*`

## Deploy (Vercel)
Preporuceni produkcioni setup:
1. Deploy aplikacije na Vercel
2. Koriscenje managed Postgres baze (Neon/Supabase/Railway)
3. Podesavanje produkcionih env varijabli na Vercel-u:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_APP_NAME`
4. Pokretanje migracija (`npm run db:push`) nad produkcionom bazom

## Status
Trenutna implementacija pokriva auth, profile, runs, chat, ratings, dashboard i admin tokove, uz pocetnu bazu automatizovanih testova.
