# Frequently Asked Questions

## General Questions

### What is this project?
A demonstration of SpacetimeDB's capabilities through a real-time collaborative kanban board application. It showcases live sync, presence, activity tracking, and row-level security.

### Why SpacetimeDB instead of traditional stack?
- **Simplicity**: No separate backend, API, or WebSocket server needed
- **Real-time**: Built-in subscriptions, no polling or manual sync
- **Performance**: In-memory database with persistence
- **Scale**: Designed for thousands of concurrent users

### Is this production-ready?
This is a demo application showcasing SpacetimeDB features. For production use, you'd want to add:
- Authentication system
- Error handling and retry logic
- Monitoring and analytics
- Backup strategies

## Development Questions

### How do I add a new feature?
1. Start with the server (add tables/reducers)
2. Regenerate TypeScript bindings
3. Create/update client stores
4. Build UI components
5. See [Development Guide](development.md) for details

### Why Svelte 5?
- New runes system works great with SpacetimeDB's reactivity
- Excellent TypeScript support
- Small bundle size
- Fast performance

### Can I use React/Vue/Angular instead?
Yes! SpacetimeDB has a JavaScript SDK that works with any framework. This demo uses Svelte, but the patterns translate to other frameworks.

### How do I debug real-time sync issues?
1. Check browser DevTools Network tab for WebSocket
2. Look at console for subscription errors
3. Verify server logs with `spacetime logs kanban-plus`
4. See [Troubleshooting Guide](troubleshooting.md)

## Architecture Questions

### Where is the API?
There isn't one! SpacetimeDB clients connect directly to the database via WebSocket. Reducers run inside the database as your "API endpoints."

### How does authentication work?
- Each client gets a unique `Identity` on connection
- Identity persists across sessions via auth token
- You can add traditional auth on top (JWT, OAuth, etc.)

### What about security?
- All data modifications go through reducers
- Reducers know who's calling (`ctx.Sender`)
- Row-level security in queries
- Can add additional auth layers

### How does it scale?
- Horizontal scaling by adding nodes
- Each "module" (like kanban-plus) can run on multiple nodes
- Built for multiplayer games, so handles high concurrency

## Data Questions

### Where is data stored?
SpacetimeDB stores data in memory with durability guarantees. It persists to disk and can be configured for different durability levels.

### Can I use SQL?
SpacetimeDB supports SQL-like queries in subscriptions. For complex queries, you can use the SQL console: `spacetime sql kanban-plus`

### How do migrations work?
Currently, schema changes require recompiling and republishing the module. SpacetimeDB team is working on migration support.

### Can I import existing data?
Yes, you can:
- Write a reducer to insert data
- Use the SQL console for bulk imports
- Create a migration script

## Deployment Questions

### How do I deploy this?
1. Deploy SpacetimeDB to a server or cloud
2. Build and publish your module
3. Deploy the client as static files
4. See SpacetimeDB hosting docs for options

### What about Docker?
SpacetimeDB provides Docker images. You can create a docker-compose setup with:
- SpacetimeDB container
- Your client served by nginx
- See docs/todo for planned Docker setup

### Can I self-host?
Yes! SpacetimeDB is open source and can be self-hosted. You can run it on any Linux server or Kubernetes cluster.

## UI/UX Questions

### Why no drag-and-drop yet?
It's coming! Phase 3 of our [style overhaul](todo/TRACKING/style-overhaul.md) includes drag-and-drop with the svelte-dnd-action library.

### How do I customize the theme?
Currently using basic CSS. We're implementing shadcn-svelte with full theme support including:
- Dark/light modes
- Custom color schemes
- CSS variables

### Is it mobile-friendly?
Basic responsive design is in place. Full mobile optimization is planned in Phase 5 of the overhaul.

## Contributing Questions

### How can I help?
1. Check [available tasks](todo/TRACKING/style-overhaul.md)
2. Read [contribution guide](todo/README.md)
3. Pick a task and create a PR
4. Or report bugs/suggest features

### What's the development process?
We use Git worktrees for parallel development:
1. Create worktree for your feature
2. Make changes and commit
3. Push and create PR
4. Get review from team

### Where do I ask questions?
- Project-specific: Create an issue
- SpacetimeDB: [Discord community](https://discord.gg/spacetimedb)
- General help: See [troubleshooting](troubleshooting.md)

## Future Plans

### What features are coming?
See our roadmap:
- [UI Overhaul](todo/style-overhaul.md) - In progress
- [Gamification](todo/gamification-features.md) - Planned
- [AI Features](todo/ai-features.md) - Planned

### Will you add [feature]?
Check our docs/todo files first. If not there, feel free to suggest it! This is a demo project meant to showcase SpacetimeDB capabilities.

### How can I stay updated?
- Watch the GitHub repository
- Check docs/todo/TRACKING for progress
- Join SpacetimeDB Discord