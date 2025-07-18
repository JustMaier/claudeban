# Agent Workflows for Claude Code

This guide documents practical workflows for working with Claude Code agents on the SpacetimeDB Kanban project. It covers single agent operations, multi-agent coordination, and best practices learned from real project experience.

## Table of Contents

1. [Single Agent Workflows](#single-agent-workflows)
2. [Multi-Agent Coordination](#multi-agent-coordination)
3. [Task Management with TODOs](#task-management-with-todos)
4. [Git Worktree Strategies](#git-worktree-strategies)
5. [Context Management](#context-management)
6. [Common Commands and Patterns](#common-commands-and-patterns)
7. [Real Project Examples](#real-project-examples)
8. [Troubleshooting](#troubleshooting)

## Single Agent Workflows

### Starting a New Session

When beginning work as an agent, follow this standard flow:

```bash
# 1. Check project status
cat CLAUDE.md  # Quick overview of current state

# 2. Check available tasks
cat TODO/TRACKING/style-overhaul.md | grep ""

# 3. Review recent git activity
git log --oneline -10
git status
```

### Claiming and Starting a Task

1. **Find an Available Task**
   ```bash
   # Look for unclaimed tasks ( status)
   grep -n "" TODO/TRACKING/*.md
   ```

2. **Create Your Worktree**
   ```bash
   # From main repository
   cd /path/to/spacetimedb/initial
   git worktree add ../initial-worktrees/agent-a-[feature] -b feature/[name]
   cd ../initial-worktrees/agent-a-[feature]
   ```

3. **Update Task Status**
   - Edit tracking file: `TODO/TRACKING/[project].md`
   - Change  to =� (In Progress)
   - Add your name and timestamp

4. **Begin Implementation**
   - Review dependencies first
   - Follow task checklist
   - Commit frequently with descriptive messages

### Task Completion Protocol

```markdown
# In tracking file, update:
**Status**:  Completed
**Assigned**: Agent A
**Started**: 2025-01-04 10:30 AM
**Completed**: 2025-01-04 2:45 PM

**Notes**:
- Implemented X, Y, Z
- Created files: A, B, C
- Modified: D, E
- Next steps: Consider adding feature F
```

### Creating Effective Commits

```bash
# Stage specific changes
git add src/lib/components/ThemeProvider.svelte
git add src/lib/stores/theme-store.svelte.ts

# Commit with clear message
git commit -m "feat(theme): implement theme provider and store

- Add 12 primary color options
- Create HSL manipulation utilities
- Implement localStorage persistence
- Support system preference detection"

# Push to remote
git push -u origin feature/theme-system
```

## Multi-Agent Coordination

### Parallel Work Distribution

The project is designed for efficient parallel development:

```
Phase 2: 2 agents can work simultaneously
   Agent A: Theme System (theme-store, colors, persistence)
   Agent B: Component Library (button, input, card components)

Phase 3: 5 agents working on different component sets
   Agent A: User components (UserDisplay, UserAvatar)
   Agent B: Card components (KanbanCard, CardModal)
   Agent C: Drag-and-drop system
   Agent D: Metric components (MetricDisplay, Timer)
   Agent E: Theme components (ThemeSwitcher, ColorPicker)
```

### Communication Through Tracking Files

Agents communicate asynchronously through tracking files:

```markdown
## Agent Handoff Notes

**From Agent A to Agent B**:
- Theme store is complete at `src/lib/stores/theme-store.svelte.ts`
- Use `$theme.colors.primary` for primary color
- CSS variables are automatically updated
- See ThemeProvider usage in +layout.svelte
```

### Dependency Management

Before starting work, check dependencies:

```bash
# Check if required phases are complete
grep "Phase 1" TODO/TRACKING/style-overhaul.md | grep ""

# Verify specific components exist
ls client/src/lib/components/ui/
```

### Avoiding Conflicts

1. **File-Level Separation**
   - Each agent works on different files
   - Coordinate through imports, not modifications

2. **Component Boundaries**
   ```
   Agent A creates: theme-store.svelte.ts
   Agent B imports: import { theme } from '$lib/stores/theme-store.svelte.ts'
   ```

3. **Worktree Isolation**
   - Each agent has their own worktree
   - No direct file conflicts possible

## Task Management with TODOs

### Using Claude Code's TODO System

Claude Code provides built-in TODO management:

```typescript
// When starting a complex task
TodoWrite({
  todos: [
    {
      id: "setup-1",
      content: "Initialize shadcn-svelte",
      status: "pending",
      priority: "high"
    },
    {
      id: "setup-2",
      content: "Configure Tailwind CSS",
      status: "pending",
      priority: "high"
    },
    {
      id: "setup-3",
      content: "Test component imports",
      status: "pending",
      priority: "medium"
    }
  ]
})
```

### TODO Best Practices

1. **Create TODOs for Multi-Step Tasks**
   - Any task with 3+ steps
   - Complex refactoring
   - Feature implementations

2. **Update Status in Real-Time**
   ```typescript
   // Mark as in progress before starting
   updateTodoStatus("setup-1", "in_progress")
   
   // Complete after verification
   updateTodoStatus("setup-1", "completed")
   ```

3. **Priority Guidelines**
   - =4 `high`: Blocking other work
   - =� `medium`: Should complete soon
   - =� `low`: When time permits

### Project-Level Tracking

Our project uses markdown-based tracking in `TODO/TRACKING/`:

```markdown
### Phase 2: Foundation Components
**Status**: =� In Progress (1/2 completed)

#### 2.1 Theme System Implementation
**Status**:  Completed
**Assigned**: Agent A
**Started**: 2025-01-04 10:30 AM
**Completed**: 2025-01-04 2:45 PM

- [x] Create theme-store.svelte.ts
- [x] Implement 12 primary colors
- [x] HSL manipulation functions
- [x] ThemeProvider component
- [x] localStorage persistence
```

## Git Worktree Strategies

### Standard Worktree Setup

```bash
# Directory structure
spacetimedb/
   initial/                    # Main repository
      .git/                  # Shared git repository
      client/
      server/
      TODO/
   initial-worktrees/         # Worktree container
       agent-a-theme/         # Feature branches
       agent-b-components/
       agent-c-drag-drop/
```

### Creating Feature Worktrees

```bash
# Standard feature branch
git worktree add ../initial-worktrees/agent-theme -b feature/theme-system

# Hotfix branch
git worktree add ../initial-worktrees/hotfix-auth -b hotfix/auth-error

# Experimental branch
git worktree add ../initial-worktrees/experiment-ai -b experiment/ai-features
```

### Worktree Lifecycle

1. **Creation**
   ```bash
   git worktree add ../initial-worktrees/my-feature -b feature/name
   cd ../initial-worktrees/my-feature
   ```

2. **Development**
   ```bash
   # Work normally
   npm install
   npm run dev
   # Make changes, commit frequently
   ```

3. **Syncing with Main**
   ```bash
   git fetch origin
   git rebase origin/main  # or merge if preferred
   ```

4. **Cleanup After Merge**
   ```bash
   cd ../../initial  # Return to main repo
   git worktree remove ../initial-worktrees/my-feature
   git branch -d feature/name  # Delete local branch
   ```

### Advanced Worktree Patterns

**Testing Multiple Features Together**:
```bash
# Create integration worktree
git worktree add ../initial-worktrees/integration -b integration/test

# Merge multiple features
cd ../initial-worktrees/integration
git merge origin/feature/theme-system
git merge origin/feature/drag-drop
```

**Quick Experiments**:
```bash
# Temporary worktree for experiments
git worktree add ../tmp/experiment HEAD

# Work without creating a branch
cd ../tmp/experiment
# Test ideas...

# Remove when done
git worktree remove ../tmp/experiment
```

## Context Management

### CLAUDE.md as Living Context

The `CLAUDE.md` file serves as the primary context document:

```markdown
# SpacetimeDB Kanban - Agent Instructions

Last Updated: 2025-01-03 (Manual - run `/project:sync-status` to update)

## <� Current Sprint Focus
[Current phase and priorities]

## =� Project Status
[Active work, completed tasks, available work]

## =� Quick Start
[Essential commands for productivity]
```

### Maintaining Context Between Sessions

1. **Update CLAUDE.md Regularly**
   ```bash
   # Use custom command
   /project:sync-status
   ```

2. **Document Decisions in Code**
   ```typescript
   // Decision: Using HSL for theme colors to enable
   // easy lightness adjustments for dark/light modes
   export function adjustLightness(hsl: string, amount: number) {
     // Implementation...
   }
   ```

3. **Leave Breadcrumbs in Commits**
   ```bash
   git commit -m "refactor(theme): switch to HSL color format

   Changed from hex to HSL format to support dynamic
   color adjustments. This enables proper dark mode
   contrast ratios without maintaining separate palettes.
   
   See discussion in TODO/TRACKING/style-overhaul.md"
   ```

### Context for Complex Features

When implementing complex features, create feature-specific context:

```markdown
<!-- TODO/CONTEXT/drag-drop-implementation.md -->
# Drag and Drop Implementation Context

## Architecture Decision
Using native HTML5 drag-and-drop with SortableJS fallback

## Key Components
- DragContainer.svelte: Wrapper for draggable areas
- DragItem.svelte: Individual draggable element
- stores/drag-store.ts: Global drag state

## Integration Points
- SpacetimeDB: Update card.position on drop
- Theme: Use $theme.colors.primary for drag indicators
```

## Common Commands and Patterns

### Essential Development Commands

```bash
# Server Development
spacetime publish --project-path server kanban-plus
spacetime start kanban-plus
spacetime logs kanban-plus

# Client Development
cd client
npm run dev           # Start dev server
npm run check         # TypeScript checking
npm run build         # Production build
npm run preview       # Preview production build

# Git Worktree Management
git worktree list     # Show all worktrees
git worktree prune    # Clean up deleted worktrees
```

### Custom Project Commands

```bash
# Quick setup for new agents
/project:setup-spacetimedb

# Sync project status
/project:sync-status

# Claim a specific task
/project:claim-task phase2-theme-system

# Get started guide
/project:get-started
```

### Search and Analysis Patterns

```bash
# Find all TODO items
rg "TODO|FIXME|HACK" --type ts --type svelte

# Find unused exports
rg "export (function|const|class)" --type ts | \
  cut -d: -f2 | grep -o "export [^=]*" | \
  sort | uniq > exports.txt

# Check for theme integration
rg "\$theme" client/src --type svelte

# Find all SpacetimeDB reducers
rg "Reducer\(" server/
```

### Testing Patterns

```bash
# Test real-time sync
# Terminal 1: Start server
spacetime start kanban-plus

# Terminal 2: Start client
cd client && npm run dev

# Terminal 3: Watch server logs
spacetime logs kanban-plus -f

# Open multiple browser tabs to test sync
```

## Real Project Examples

### Example 1: Implementing Theme System

**Agent A's Workflow**:

1. **Claim Task**
   ```bash
   git worktree add ../initial-worktrees/agent-a-theme -b feature/theme-system
   cd ../initial-worktrees/agent-a-theme
   ```

2. **Create Theme Store**
   ```typescript
   // client/src/lib/stores/theme-store.svelte.ts
   import { writable } from 'svelte/store';
   
   type Theme = {
     mode: 'light' | 'dark';
     colors: {
       primary: string;
       // ... other colors
     };
   };
   
   function createThemeStore() {
     const { subscribe, set, update } = writable<Theme>(
       loadThemeFromStorage()
     );
     
     return {
       subscribe,
       setMode: (mode: 'light' | 'dark') => {
         update(t => ({ ...t, mode }));
       },
       // ... other methods
     };
   }
   
   export const theme = createThemeStore();
   ```

3. **Update Tracking**
   ```markdown
   - [x] Create theme-store.svelte.ts
   - [x] Implement theme persistence
   - [ ] Create ThemeProvider component
   ```

4. **Commit Progress**
   ```bash
   git add -A
   git commit -m "feat(theme): create theme store with persistence"
   git push -u origin feature/theme-system
   ```

### Example 2: Multi-Agent Component Development

**Scenario**: Three agents building components simultaneously

**Agent B - Button Component**:
```svelte
<!-- client/src/lib/components/ui/button/button.svelte -->
<script lang="ts">
  import { theme } from '$lib/stores/theme-store.svelte.ts';
  // Agent B can use Agent A's theme store immediately
</script>
```

**Agent C - Card Component**:
```svelte
<!-- client/src/lib/components/ui/card/card.svelte -->
<script lang="ts">
  import { Button } from '../button';
  // Agent C can use Agent B's button component
</script>
```

### Example 3: Handling Dependencies

**Situation**: Agent D needs shadcn-svelte initialized (Phase 1) before starting Phase 2 work.

```bash
# Agent D checks status
grep "Phase 1" TODO/TRACKING/style-overhaul.md

# Sees Phase 1 incomplete, picks it up
git worktree add ../initial-worktrees/agent-d-shadcn -b feature/shadcn-init

# Completes Phase 1
cd ../initial-worktrees/agent-d-shadcn/client
npx shadcn-svelte@latest init

# Updates tracking
# Phase 1:  Completed

# Now can proceed with Phase 2 work
```

## Troubleshooting

### Common Issues and Solutions

**Worktree Already Exists**:
```bash
# Error: worktree already exists
git worktree list  # Check existing
git worktree remove ../initial-worktrees/old-feature
```

**Branch Name Conflicts**:
```bash
# Error: branch already exists
git branch -a | grep feature/theme
# Use different name or checkout existing
git worktree add ../wt/theme feature/theme-system-v2
```

**Merge Conflicts After Rebase**:
```bash
git status  # See conflicted files
# Edit conflicts in VS Code or preferred editor
git add .
git rebase --continue
```

**SpacetimeDB Connection Issues**:
```bash
# Check if server is running
spacetime logs kanban-plus

# Restart if needed
spacetime start kanban-plus --restart

# Verify WebSocket endpoint
# Should be: ws://localhost:3000/kanban-plus
```

**Missing Dependencies After Worktree Creation**:
```bash
# Always run npm install in new worktrees
cd client
npm install

# For server changes, rebuild
cd ../server
dotnet build
```

### Recovery Procedures

**Interrupted Work Session**:
1. Check last commit: `git log -1`
2. Check tracking status: `cat TODO/TRACKING/*.md | grep -A5 "In Progress"`
3. Review uncommitted changes: `git status && git diff`
4. Continue from last checkpoint

**Accidental Main Branch Changes**:
```bash
# Create backup branch
git checkout -b backup-changes

# Reset main to origin
git checkout main
git reset --hard origin/main

# Cherry-pick changes to feature branch
git checkout -b feature/proper-branch
git cherry-pick backup-changes
```

---

## Summary

Effective agent workflows rely on:
1. **Clear task ownership** through tracking files
2. **Isolation through worktrees** to prevent conflicts
3. **Frequent communication** via commits and documentation
4. **Consistent patterns** for common operations
5. **Proactive context management** to maintain continuity

The combination of git worktrees, markdown-based tracking, and Claude Code's built-in tools creates a powerful environment for both single-agent and multi-agent development scenarios.