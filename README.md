# DAILY QUEST

A personal improvement system built around five daily goals, XP progression, and a monthly real-life reward battlepass. Inspired by game quest screens — designed with a Marathon-style sci-fi terminal aesthetic.

## Features

- **Today Screen**: five daily objectives, XP tracking, perfect-day bonus, battlepass progress.
- **Setup**: configure dailies and monthly battlepass reward tiers.
- **Battlepass**: view reward track, claim unlocked rewards.
- **Monthly Review**: summary stats, completion rates, reflection prompts.
- **Mission Log**: daily history table and archived reviews.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Local Storage persistence (single-user, no backend required)
- Vitest + React Testing Library

## Scripts

```bash
npm run dev      # start dev server
npm run build    # static export to ./dist
npm test         # run tests
npm run serve    # serve ./dist on 0.0.0.0:3000 (for local/Tailscale viewing)
```

## Local viewing (e.g. over Tailscale)

```bash
npm run build
npm run serve
```

Then open `http://<tailscale-ip>:3000`.

## Deployment

The repo is configured for static export. To deploy on Vercel:

1. Authenticate the Vercel CLI: `vercel login`
2. Run: `vercel --prod`

Or connect the GitHub repo to a Vercel project via the dashboard.

## Aesthetic Reference

Inspired by [Marathon](https://www.marathonthegame.com/): black backgrounds, neon lime (`#c0fe04`) accents, sharp rectangular UI, terminal-style brackets, monospace data labels, and scanline overlay.
