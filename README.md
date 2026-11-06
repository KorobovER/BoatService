# BoatService Admin

Admin panel for the **bola** platform — a marina and boat reservation management service. Built with [Vite](https://vitejs.dev/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [TanStack Query](https://tanstack.com/query), [TanStack Router](https://tanstack.com/router) and [Chakra UI](https://chakra-ui.com/).

## Features

- **Marinas** — manage marinas and their details
- **Mooring balls** — manage mooring ball inventory on the map
- **Boats** — boat registry and details
- **Reservations** — create and manage reservations, view statuses (including `checked_in_locked`), service payment details
- **Admin** — employee/user management
- **User settings** — profile and preferences
- **Auth** — login, signup, password recovery/reset
- Interactive maps via `google-map-react`

The API client is generated from `openapi.json` with [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts) (axios client, exported schemas).

## Requirements

- Node.js 20 (see `.nvmrc`) — via nvm or fnm
- npm

## Getting started

```bash
nvm install   # or: fnm install
nvm use       # or: fnm use
npm install
npm run dev
```

Open http://localhost:5173/.

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the backend API |
| `REACT_APP_MAP_API_KEY` | Google Maps API key |

Create a `.env` file in the project root, e.g.:

```env
VITE_API_URL=https://api.example.com
REACT_APP_MAP_API_KEY=your-key
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check (`tsc`) and build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint/format check with Biome |
| `npm run generate-client` | Regenerate API client from `openapi.json` |
| `npx playwright test` | Run e2e tests (requires running backend) |

## Project structure

```
src/
├── client/       # Generated OpenAPI client
├── components/   # Feature components (Admin, Boats, Calendar, Maps,
│                 # Marinas, MooringBalls, Reservations, ServicesPanel, ...)
├── context/      # React contexts (e.g. MarinaContext)
├── hooks/        # Custom hooks
├── routes/       # TanStack Router routes/pages
├── theme/        # Chakra UI custom theme
├── utils.ts
└── utilsBola.ts
tests/            # Playwright e2e tests
openapi.json      # Backend OpenAPI spec (source for client generation)
```

## Regenerating the API client

When the backend schema changes:

1. Export the updated OpenAPI JSON from the backend (`/api/v1/openapi.json`) and replace `openapi.json`.
2. Simplify operation IDs:

   ```bash
   node modify-openapi-operationids.js
   ```

3. Regenerate the client:

   ```bash
   npm run generate-client
   ```

4. Commit the changes.

## Docker

The `Dockerfile` builds the app (Node 20) and serves it with nginx:

```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  --build-arg REACT_APP_MAP_API_KEY=your-key \
  -t boatservice-admin .
docker run -p 8080:80 boatservice-admin
```
