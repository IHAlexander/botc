# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node/npm are at `/c/Program Files/nodejs` and must be added to PATH in each bash session:
```bash
export PATH="/c/Program Files/nodejs:$PATH"
```

**Dev (two terminals):**
```bash
cd server && node index.js          # port 3001
cd client && npm run dev            # port 5173, proxies /api and /ws to :3001
```

**Production build:**
```bash
cd client && npm run build          # outputs to client/dist/
cd server && node index.js          # serves client/dist + WS on :3001
```

**Install dependencies** (single lock file at root due to workspaces):
```bash
npm install --workspaces
# or individually:
cd server && npm install
cd client && npm install
```

There are no tests or linter configured.

## Architecture

Single-game, single-server. State lives entirely in memory on the server and is reset on restart.

### State flow
1. `server/gameState.js` holds the authoritative state and exports pure mutation functions
2. `server/index.js` receives WebSocket messages, calls the appropriate mutation, then broadcasts the full serialised state to all clients as `STATE_UPDATE`
3. `client/src/ws.js` is a singleton module that connects on load, stores the latest state, and exposes a `useSyncExternalStore`-compatible `{ getState, subscribe, send }` interface
4. Every page/component calls `useSyncExternalStore(subscribe, getState)` to re-render on any state change

### Key design points
- **No per-player state isolation**: all clients receive the full game state (roles, alignments, etc). Role secrecy is a UI convention only — `PlayerPage` simply doesn't render other players' roles.
- **Player identity**: players are identified by their WebSocket connection object (`ws`) on the server. `sessionStorage` holds `botc_name` and `botc_role` on the client to survive page navigation but not tab close.
- **Night order**: computed dynamically in `serialiseState()` by sorting script characters on their numeric `firstNight`/`otherNight` fields from the character database — it is never stored in the script JSON files.
- **Custom scripts**: uploaded JSON is passed directly as `customJson` via WebSocket. Characters not found in `characters.json` are used as-is with whatever fields the JSON provides.

### Data files (`server/data/`)
- `characters.json` — 130 characters sourced from `bra1n/townsquare` `src/roles.json`. Each entry has `id`, `name`, `team`, `ability`, `firstNight`, `otherNight`, `reminders`, etc.
- `trouble-brewing.json`, `bad-moon-rising.json`, `sects-and-violets.json` — lists of `{ "id" }` objects plus a `_meta` entry. `setScript()` resolves each id against `characters.json`.

### WebSocket message types
| Client → Server | Payload |
|---|---|
| `JOIN` | `{ name }` |
| `JOIN_STORYTELLER` | — |
| `SET_SCRIPT` | `{ scriptId }` or `{ customJson }` |
| `ASSIGN_ROLE` | `{ playerId, roleId }` |
| `UPDATE_STATUS` | `{ playerId, status, ghostVoteUsed }` |
| `ADD_REMINDER` | `{ playerId, label }` |
| `REMOVE_REMINDER` | `{ playerId, label }` |

Server always responds with a broadcast of `{ type: 'STATE_UPDATE', payload: <full state> }`.
