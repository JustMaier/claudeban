# SpacetimeDB Kanban - Agent Instructions

Last Updated: 2025-01-03 (Manual - run `/project:sync-status` to update)

## 🎯 Current Sprint Focus

**Phase 1: Infrastructure** - Setting up shadcn-svelte and core systems for UI overhaul.

## 📊 Project Status

- **Active Phase**: Phase 1 (0/3 tasks completed)
- **Recently Completed**: 
  - ✅ Project planning documentation
  - ✅ Git worktree SOPs
  - ✅ Future feature specifications
- **In Progress**: None (Phase 1 ready to start)
- **Available Tasks**: 
  - shadcn-svelte initialization
  - Server model updates (position, theme fields)
  - New reducers for sorting and themes

## 🚀 Quick Start (30 seconds to productivity)

1. **Check available work**:
   ```bash
   cat docs/todo/TRACKING/style-overhaul.md | grep "⬜"
   ```

2. **Claim a task**:
   ```bash
   # Create your worktree
   git worktree add ../initial-worktrees/[your-name]-[feature] -b feature/[feature-name]
   cd ../initial-worktrees/[your-name]-[feature]
   
   # Update tracking file to show you've claimed it
   ```

3. **Start coding**:
   - Follow SOPs in `docs/todo/README.md`
   - Check dependencies in tracking file
   - Commit frequently in your branch

## 📁 Essential Locations

- `/docs/todo/README.md` - Complete SOPs and procedures
- `/docs/todo/TRACKING/style-overhaul.md` - Current work status
- `/.claude/commands/` - Custom commands for common tasks
- `/docs/` - Human-friendly documentation
- `/.claude/archive/setup-guide.md` - Original setup instructions

## 🛠️ Key Commands

```bash
# Setup environment (NEW: Docker recommended for agents)
/project:start-dev-env        # Start Docker environment with visual testing
/project:setup-spacetimedb    # Alternative: manual setup

# Visual testing (for UI work)
/project:test-visual responsive  # Capture all viewports/themes
/project:test-visual custom my-test.js  # Run custom Puppeteer test

# Project management
/project:sync-status          # Update this file with latest info
/project:claim-task [task-id] # Claim and start a task

# Common development commands
docker-compose exec spacetimedb spacetime publish --project-path /workspace/server kanban-plus
docker-compose exec client npm run db:generate
docker-compose logs -f [service]
```

## 🎨 What We're Building

A modern UI overhaul featuring:
- **shadcn-svelte** component library
- **Dark/light modes** with custom theme colors
- **Drag-and-drop** card management
- **Mobile responsive** design
- **Real-time collaboration** features

See [docs/todo/style-overhaul.md](docs/todo/style-overhaul.md) for the complete plan.

## 🔄 Development Workflow

1. **Create worktree** for isolation
2. **Update tracking** to claim your task
3. **Make changes** following the plan
4. **Test locally** with multiple browser tabs
5. **Commit and push** to your branch
6. **Create PR** for review

## ⚡ Current Opportunities

### Phase 1 Tasks (Start Here!)
- [ ] Run shadcn-svelte init and configure Tailwind
- [ ] Add position field to Card table + sorting reducer
- [ ] Add theme fields to User table + preference reducer

### Parallel Work Available (Phase 2+)
- Theme system implementation (after Phase 1)
- Component library setup (after Phase 1)
- Multiple component development tracks (after Phase 2)

## 🔗 Quick Links

- [Full SOPs](docs/todo/README.md)
- [Architecture Overview](docs/architecture/architecture.md)
- [Development Guide](docs/development.md)
- [Troubleshooting](docs/troubleshooting.md)

---

*For setup instructions, see [.claude/archive/setup-guide.md](.claude/archive/setup-guide.md)*