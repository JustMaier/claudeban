# Original Setup Guide

*Note: This is the original setup guide archived for reference. For current setup instructions, see [README.md](../README.md)*

---

### Goal in One Sentence

Spin up a full-stack demo of **SpacetimeDB**: a C# "Kanban-Plus" server module (showcasing every DB feature) and a Svelte 5 + TypeScript front-end that live-syncs boards/cards, all running on your local machine.

---

### What's Already Done

1. **Server module design**
   * Tables: `user`, `board`, `card`, `metric`, `metric_timer`
   * Reducers: init / presence hooks, CRUD for boards & cards, nightly metric roll-up
   * Row-level security filter example

2. **Client skeleton**
   * Svelte 5 runes app scaffolded with Vite
   * SpacetimeDB TS SDK installed
   * Typed bindings generator wired
   * Reactive UI: create boards/cards, live subscription

---

### Local Setup Checklist

| Step | Command / File | Outcome |
|------|---------------|---------|
| **1. Install toolchain** | `curl -s https://install.spacetimedb.com | bash`<br>`dotnet workload install wasi-experimental` | `spacetime` CLI + .NET WASI ready |
| **2. Bootstrap repo** | `mkdir kanban-demo && cd kanban-demo` | project root |
| **3. Create server** | `spacetime init --lang csharp server` | `server/StdbModule.csproj` |
| **4. Paste our `Lib.cs`** | overwrite stub with provided "Kanban-Plus" code | all tables/reducers defined |
| **5. Build & publish** | `spacetime publish --project-path server kanban-plus` | `.wasm` pushed to local registry |
| **6. Start DB node** | `spacetime start kanban-plus` | WebSocket endpoint on **ws://localhost:3000/kanban-plus** |
| **7. Front-end scaffold** | `npm create vite@latest kanban-plus-client -- --template svelte@next`<br>`cd kanban-plus-client && npm i` | Svelte 5 project |
| **8. Add SDK & generate bindings** | `npm i @clockworklabs/spacetimedb-sdk`<br>`spacetime generate --lang typescript --project-path ../server --out-dir src/generated` | typed API in `src/generated` |
| **9. Paste client code** | `src/lib/stdb.ts`, `src/routes/+page.svelte` from guide | UI wired |
| **10. Run dev server** | `npm run dev` | http://localhost:5173 talking to DB |
| **11. Test** | open two tabs, create boards/cards, watch real-time sync | success |

---

### Where the AI Agent Can Pitch In

1. **Env bumps**
   * Troubleshoot dotnet-wasi build errors (PATH, SDK versions).
   * Verify `spacetime` CLI install on Windows/Linux differences.

2. **Compilation issues**
   * C# warnings (nullable, STDB_UNSTABLE pragmas).
   * TypeScript path aliases or vite config tweaks.

3. **Hot-reload Dev UX**
   * Script to rebuild & republish server on code change (`watchexec`, `nodemon`, etc.).
   * Auto-restart `spacetime start` and reconnect clients.

4. **RLS & auth polish**
   * Extend visibility filters or add JWT-based identity mapping.

5. **UI niceties**
   * Tailwind styling, drag-&-drop columns, optimistic card reorder.

6. **Packaging**
   * Docker-compose file with Spacetime node + Vite dev server for one-command spin-up.