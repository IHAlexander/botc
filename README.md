# Blood on the Clocktower — LAN Web App

A LAN-hosted assistant for playing Blood on the Clocktower with up to 20 players.
The storyteller runs a local server; players connect from phones/browsers on the same WiFi.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+

## Setup

```bash
# Install all dependencies
npm install --workspaces

# Or individually:
cd server && npm install
cd client && npm install
```

## Development (two terminals)

```bash
# Terminal 1 — server on :3001
cd server && node index.js

# Terminal 2 — Vite dev server on :5173 (proxies to server)
cd client && npm run dev
```

## Production (LAN play)

```bash
cd client && npm run build
cd server && node index.js   # serves client/dist + WebSocket on :3001
```

Players connect to `http://<storyteller-ip>:3001`

## Scripts bundled

- Trouble Brewing
- Bad Moon Rising
- Sects & Violets

Custom scripts: upload any `.json` file in standard BotC script format on the Storyteller page.

## Architecture

```
botc/
├── server/
│   ├── index.js        Express + WebSocket server
│   ├── gameState.js    In-memory authoritative game state
│   └── data/           Official script JSONs + character database
└── client/src/
    ├── ws.js           WebSocket singleton + state store
    ├── pages/          JoinPage, PlayerPage, StorytellerPage
    └── components/     Grimoire, PlayerToken, ScriptViewer, NightOrder
```

## WebSocket Protocol

| Client → Server | Payload |
|---|---|
| `JOIN` | `{ name }` |
| `JOIN_STORYTELLER` | — |
| `SET_SCRIPT` | `{ scriptId }` or `{ customJson }` |
| `ASSIGN_ROLE` | `{ playerId, roleId }` |
| `UPDATE_STATUS` | `{ playerId, status, ghostVoteUsed }` |
| `ADD_REMINDER` | `{ playerId, label }` |
| `REMOVE_REMINDER` | `{ playerId, label }` |

Server broadcasts `STATE_UPDATE` (full state) after every mutation.
