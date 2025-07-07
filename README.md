# SpacetimeDB Kanban Demo

A real-time collaborative kanban board showcasing SpacetimeDB's capabilities with live sync, presence, and activity tracking.

## 🚀 Quick Start

### Option 1: Docker Development (Recommended for AI Agents)
```bash
# Start complete environment with visual testing
/project:start-dev-env

# Or manually:
docker-compose -f docker-compose.dev.yml up -d
```
See [Docker Guide](docker/README.md) for details.

### Option 2: Use Claude Code
```bash
# Run this command in Claude Code:
/project:setup-spacetimedb
```

### Option 3: Manual Setup
- **Linux/Mac**: [Setup Guide](docs/setup/setup-linux.md)
- **Windows**: [Setup Guide](docs/setup/setup-windows.md)
- **Quick Install**: `curl -sSf https://install.spacetimedb.com | bash`

## 🎮 Key Commands

```bash
# Start the database
spacetime start kanban-plus

# Run the app (in another terminal)
cd client && npm run dev

# Rebuild after server changes
spacetime publish --project-path server kanban-plus

# Watch for TypeScript errors
cd client && npm run check
```

## 📚 Documentation

- [Architecture Overview](docs/architecture/architecture.md) - How it all works
- [Development Guide](docs/development.md) - Contributing code
- [SpacetimeDB Concepts](docs/spacetimedb/spacetimedb-intro.md) - Database fundamentals
- [Feature Roadmap](docs/todo/style-overhaul.md) - What we're building

## 🤝 Contributing

1. Check [available tasks](docs/todo/TRACKING/style-overhaul.md)
2. Read our [contribution guide](docs/todo/README.md)
3. Pick a task and start coding!

### For AI Agents
See [CLAUDE.md](CLAUDE.md) for agent-specific instructions and current sprint status.

## 🎯 Current Focus

We're implementing a modern UI overhaul with:
- 🎨 shadcn-svelte components
- 🌓 Dark/light mode with custom themes
- 🎯 Drag-and-drop card management
- 📱 Mobile responsive design

Track progress: [docs/todo/TRACKING/style-overhaul.md](docs/todo/TRACKING/style-overhaul.md)

## 🏗️ Project Structure

```
initial/
├── client/              # Svelte 5 frontend
│   ├── src/lib/        # Components & stores
│   └── src/generated/  # SpacetimeDB bindings
├── server/             # C# SpacetimeDB module
│   └── domains/        # Table & reducer definitions
├── docs/               # Documentation
│   └── todo/           # Planning & tracking
└── .claude/            # AI agent tools
```

## 🚦 Status

- ✅ Core functionality complete
- ✅ Real-time sync working
- ✅ Activity tracking implemented
- 🚧 UI/UX overhaul in progress
- 📋 AI features planned

## 📞 Getting Help

- **Issues**: Check [troubleshooting](docs/troubleshooting.md)
- **Questions**: See our [FAQ](docs/faq.md)
- **Bugs**: Report in [GitHub Issues](https://github.com/your-repo/issues)

---

Built with [SpacetimeDB](https://spacetimedb.com) - the database for multiplayer applications.