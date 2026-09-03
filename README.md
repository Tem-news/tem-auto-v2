# TemAuto

TemAuto is an independent global vehicle marketplace for buying and selling cars.

## Project identity

- Project: TemAuto
- Repository: Tem-news/tem-auto-v2
- Application framework: Next.js
- Database and storage: Supabase
- Hosting: Vercel
- Primary branch: main
- Development branch: develop

## Product direction

TemAuto is being developed as a simple and accessible global vehicle marketplace.

Planned capabilities include:

- buying and selling vehicles;
- automatic region suggestions based on the user's location;
- manual country, region and search-radius selection;
- automatic language suggestions;
- manual language selection;
- regional currencies and measurement units;
- mobile-first use;
- worldwide availability.

## Environment variables

Create a local .env.local file using .env.example as the reference.

Required public variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Never commit real passwords, private keys or Supabase service-role keys.

## Development

Install dependencies: npm install

Start the local development server: npm run dev

Create a production build: npm run build

## Isolation rule

TemAuto is a separate project and must not use TEM News repositories, Cloudflare Workers, secrets, domains or deployment configuration.

## Development workflow

New changes are first committed to the develop branch and verified in a Vercel Preview deployment. Only approved changes are merged into main.
