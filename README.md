# AU NBA Stats

A client-side SPA tracking Australian NBA players through the current season. No backend — all data is fetched directly from NBA's public CDN and cached in `localStorage`.

## Tech Stack

| Technology | Role |
|---|---|
| React | UI framework |
| TypeScript | Type safety |
| Vite | Build tooling and dev server |
| Tailwind CSS | Styling |

See [`package.json`](./package.json) for dependency versions.

## Features

- **Three view modes**: last game, last 5 game averages, full season averages
- **Sortable columns**: click any column header to sort; click again to reverse
- **Stat leaders**: top performer per stat is highlighted in each view
- **Team records**: win/loss record shown per player
- Game context per player: date, matchup, result, starter/bench status

## Data Source

Stats are fetched from `cdn.nba.com` static JSON — no API key required, CORS-friendly.

- **Schedule**: `https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json` (cached 6 hours)
- **Boxscores**: `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_{GAME_ID}.json` (cached indefinitely for completed games)

In development, requests are proxied through Vite (`/nba-cdn`) to satisfy CORS. In production builds the CDN is accessed directly.

## Getting Started

```bash
npm install
npm run dev
```

## Configuration

Edit [`src/config/players.ts`](./src/config/players.ts) to change which players are tracked. Player IDs are NBA.com person IDs, visible in the URL on `nba.com/player/{id}`.
