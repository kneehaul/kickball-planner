# Kickball Planner

A browser-based kickball roster planning tool for managing player assignments across multiple innings.

Website: https://kickball-planner.npabba.com/

<img width="1277" height="1043" alt="Screenshot 2026-05-09 at 2 37 01 PM" src="https://github.com/user-attachments/assets/0ea53394-de63-441f-b313-ea2334e2e06e" />

## Features

- **Player management** — add/remove players, assign per-player colors, reorder via drag-and-drop or touch
- **Multi-inning rosters** — create multiple innings and assign players to all 10 field positions (pitcher, catcher, 1st/2nd/3rd base, shortstop, left/left-center/right-center/right field)
- **Interactive field view** — SVG baseball diamond with dropdowns at each position; live bench list of unassigned players per inning
- **Inning management** — add, delete, and rename innings (double-click a tab to rename); summary table of all assignments
- **Print / PDF export** — browser print produces a cover page with kicking order and full assignment table, followed by one field diagram per inning with bench list
- **Local persistence** — players, colors, innings, rosters, and custom names are saved to browser `localStorage` and survive refresh

## Stack

- Frontend: Vite + React (`client/`)
- Backend: Cloudflare Workers + Hono (`cloudflare-workers/`) — currently a stub with a `/api/ping` route
