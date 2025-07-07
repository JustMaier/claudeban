# TODO Directory - Project Planning & Agent Organization

This directory contains all project planning documents, feature specifications, and work tracking for the SpacetimeDB Kanban application.

## Directory Structure

```
docs/todo/
├── README.md                    # This file - organizational SOPs
├── TRACKING/                    # Active work tracking
│   └── style-overhaul.md       # Current UI overhaul progress
├── REVIEW/                      # Review checklists for completed features
│   ├── README.md               # Review process guide
│   └── docker.md               # Docker environment review
├── FEEDBACK/                    # Human feedback on reviews
│   └── README.md               # Feedback template and guide
├── style-overhaul.md           # Master plan for UI redesign
├── gamification-features.md    # 20 real-time gamified features
├── ai-features.md              # 8 AI-powered productivity features
└── [future-feature].md         # Additional feature plans
```

## Agent Standard Operating Procedures (SOPs)

### 1. Starting Work on a Task

When an agent begins work:
1. Create a Git worktree for your work (see Git Worktree Setup below)
2. Open the relevant tracking file in `docs/todo/TRACKING/`
3. Find your assigned section
4. Update status from ⬜ to 🟦 (In Progress)
5. Add your name and start timestamp
6. Begin working through the checklist

### 2. Task Completion Protocol

For each subtask:
- Check off completed items with [x]
- Add notes about implementation decisions
- Document any files created/modified
- Note any discovered dependencies

When finishing a section:
1. Update status to ✅ (Completed)
2. Add completion timestamp
3. Document any remaining work in notes
4. Commit your changes in your worktree
5. Create a PR for review

### 3. Handling Blockers

If blocked:
1. Update status to ❌ (Blocked)
2. Document the specific blocker
3. Create issue in main tracker if needed
4. Notify team or move to next task

### 4. Work Handoff Protocol

When handing off work:
1. Ensure all checkboxes reflect current state
2. Add detailed notes about:
   - What was completed
   - What remains
   - Any tricky parts encountered
   - Decisions made
3. Commit with message: "Handoff: [Component] - [Status]"

### 5. Parallel Work Guidelines

Multiple agents can work simultaneously:
- Phase 2: 2 agents (Theme System, Component Library)
- Phase 3: 5 agents (different component sets)
- Phase 4: 3 agents (different UI sections)
- Phase 5: 5 agents (different features)

Coordination rules:
- Check dependencies before starting
- Avoid modifying same files simultaneously
- Use feature branches if needed
- Communicate through tracker notes

### 6. File Naming Conventions

**Tracking Files**: `docs/todo/TRACKING/[project-name].md`
- Use kebab-case
- Keep names descriptive but concise

**Feature Plans**: `docs/todo/[feature-category]-[specifics].md`
- Examples: `ai-features.md`, `mobile-responsive.md`

**Component Files**: Follow existing patterns
- `UserDisplay.svelte` not `user-display.svelte`
- Keep consistent with shadcn-svelte conventions

### 7. Progress Tracking

Update overall progress percentages:
```
Phase 1: ⬜ 0/3 tasks completed
Phase 1: 🟦 1/3 tasks completed
Phase 1: ✅ 3/3 tasks completed
```

### 8. Documentation Standards

Each feature document should include:
1. **Overview** - Brief description
2. **Implementation** - Technical approach
3. **Dependencies** - What it needs
4. **Value** - Why it matters
5. **Technical Requirements** - New tables/systems needed

### 9. Recovery Protocol

If work is interrupted:
1. Check `docs/todo/TRACKING/` for last status
2. Review git status/diff
3. Check npm/build state
4. Resume from last incomplete checkbox
5. Read handoff notes

### 10. Creating New Trackers

When starting a new major feature:
1. Create plan in `docs/todo/[feature].md`
2. Create tracker in `docs/todo/TRACKING/[feature].md`
3. Use style-overhaul.md as template
4. Include:
   - Status legend
   - Phase breakdown
   - Task checklists
   - Dependency notes
   - Recovery instructions

### 11. Feature Review Process

A standardized process for reviewing completed features and providing feedback.

#### For Agents (Creating Review)
When marking a task as ✅ completed:

1. **Create Review Checklist**:
   - Create `docs/todo/review/[feature].md`
   - Use template from `docs/todo/review/README.md`
   - Keep test steps under 5 minutes total
   - Include specific commands and expected outputs

2. **Update Tracking**:
   - Add note: "Ready for review - see docs/todo/review/[feature].md"
   - Notify team that review is needed

3. **Monitor Feedback**:
   - Check `docs/todo/feedback/[feature].md` for reviewer feedback
   - Address any "Must Fix" issues
   - Update feedback file with resolutions

#### For Humans (Providing Feedback)
1. **Run Review**:
   - Find checklist in `docs/todo/review/[feature].md`
   - Complete all test steps
   - Note any issues

2. **Create Feedback**:
   - Create `docs/todo/feedback/[feature].md`
   - Use template from `docs/todo/feedback/README.md`
   - Include:
     - ✅ What works well
     - ❌ Specific issues with reproduction steps
     - 💡 Optional suggestions
     - 🎯 Priority levels

3. **Notify Agent**:
   - Let agent know feedback is available
   - Be available for clarification questions

#### Review Standards
- Reviews should be completable in ~5 minutes
- Focus on core functionality, not every edge case
- Feedback should be specific and actionable
- Include positive feedback, not just issues
- Use priority levels to guide fixes

## Git Worktree Setup for Parallel Development

### Overview
Git worktrees allow multiple agents to work on different branches simultaneously in separate directories, avoiding conflicts and enabling frequent commits.

### Directory Structure with Worktrees
```
spacetimedb/                    # Parent directory
├── initial/                    # Main worktree (main branch)
│   ├── .git/                  # Shared repository
│   ├── client/
│   ├── server/
│   └── docs/todo/
└── initial-worktrees/         # Worktree directory
    ├── agent-a-theme/         # Agent A's worktree
    ├── agent-b-components/    # Agent B's worktree
    └── agent-c-drag-drop/     # Agent C's worktree
```

### Creating Your Worktree
```bash
# From the main repository directory
cd /path/to/spacetimedb/initial

# Create a worktree for your feature
git worktree add ../initial-worktrees/[agent-name]-[feature] -b [branch-name]

# Example for Agent A working on theme system:
git worktree add ../initial-worktrees/agent-a-theme -b feature/theme-system

# Navigate to your worktree
cd ../initial-worktrees/agent-a-theme
```

### Branch Naming Conventions
- Feature branches: `feature/[feature-name]`
- Component work: `component/[component-name]`
- UI refactoring: `refactor/[section-name]`
- Polish tasks: `polish/[task-name]`

Examples:
- `feature/theme-system`
- `component/user-display`
- `refactor/kanban-board`
- `polish/keyboard-shortcuts`

### Working in Your Worktree
1. **Make changes**: Work normally in your worktree directory
2. **Commit frequently**: Small, focused commits
3. **Push to remote**: `git push -u origin [branch-name]`
4. **Update tracking**: Keep TODO/TRACKING files updated

### Creating Pull Requests
```bash
# After pushing your branch
git push -u origin feature/theme-system

# Create PR via GitHub CLI (if available)
gh pr create --title "Add theme system" --body "Implements dark mode and color customization"

# Or create manually on GitHub/GitLab
```

### PR Review Process
1. **Self-review**: Check your changes before requesting review
2. **Request review**: Tag relevant agents or team lead
3. **Address feedback**: Make changes in your worktree
4. **Merge**: After approval, merge to main

### Managing Worktrees
```bash
# List all worktrees
git worktree list

# Remove a worktree after merging
git worktree remove ../initial-worktrees/agent-a-theme

# Clean up deleted branches
git worktree prune
```

### Syncing with Main
```bash
# In your worktree, fetch latest changes
git fetch origin

# Rebase on latest main
git rebase origin/main

# Or merge main into your branch
git merge origin/main
```

### Worktree Best Practices
1. **One worktree per feature**: Don't mix unrelated changes
2. **Clean up after merging**: Remove worktrees you're done with
3. **Sync regularly**: Rebase/merge main frequently to avoid conflicts
4. **Descriptive branch names**: Make purpose clear
5. **Update tracking first**: Before starting code changes

## Docker Development Environment

### Overview
A Docker-based environment optimized for AI agents to develop and visually test changes without needing a browser.

### Starting the Environment
```bash
# Using the command (recommended)
/project:start-dev-env

# Or manually
docker-compose -f docker-compose.dev.yml up -d
```

### Visual Testing Workflow

1. **Make UI changes** in your code
2. **Test visually** with Puppeteer:
   ```bash
   # Test all responsive views
   /project:test-visual responsive
   
   # Test interactions
   /project:test-visual interaction
   
   # Run custom test
   /project:write-visual-test button click behavior
   /project:test-visual custom test-button-click.js
   ```

3. **Review results**:
   - Check `screenshots/` for generated images
   - If errors, read `puppeteer-errors/*.log`

### Common Docker Tasks
```bash
# Update database module
docker-compose exec spacetimedb spacetime publish --project-path /workspace/server kanban-plus

# Generate TypeScript bindings
docker-compose exec client npm run db:generate

# View logs
docker-compose logs -f [service]

# Open shell in container
docker-compose exec [service] /bin/bash
```

### Using Docker with Worktrees
Each worktree can have its own Docker environment:
```bash
cd ../initial-worktrees/agent-feature
cp ../../initial/docker-compose.dev.yml .
docker-compose -p agent-feature up -d
```

### Writing Puppeteer Tests
1. Create script in `.claude/testing/puppeteer/`
2. Available variables:
   - `browser`, `page` - Puppeteer objects
   - `CLIENT_URL` - App URL
   - `SCREENSHOT_DIR` - Screenshot location
3. Run with: `docker-compose exec puppeteer run-script.sh your-script.js`

## Current Active Projects

### 1. Style Overhaul (docs/todo/TRACKING/style-overhaul.md)
- **Status**: Phase 1 Not Started
- **Goal**: Complete UI redesign with shadcn-svelte
- **Phases**: 5 phases, supporting parallel work
- **Key Features**: Dark mode, custom themes, drag & drop

### 2. Future Projects
- Performance Optimization
- Testing Infrastructure
- CI/CD Pipeline
- Documentation Site

## Quick Reference

### Status Indicators
- ⬜ Not Started
- 🟦 In Progress
- ✅ Completed
- ❌ Blocked
- ⏸️ Paused

### Priority Levels
- 🔴 Critical - Block other work
- 🟡 High - Complete ASAP
- 🟢 Normal - Standard priority
- 🔵 Low - When time permits

### Common Commands
```bash
# Check tracking status
cat docs/todo/TRACKING/style-overhaul.md | grep "Status:"

# Find incomplete tasks
grep -n "⬜\|🟦" docs/todo/TRACKING/*.md

# Update permissions if needed
edit .claude/settings.local.json

# Worktree commands
git worktree list                    # See all active worktrees
git worktree add ../wt/feature -b feature/name  # Create new worktree
git worktree remove ../wt/feature    # Remove completed worktree
```

## Best Practices

1. **Commit Often**: Small, focused commits in your worktree branch
2. **Test Locally**: Always verify changes work before marking complete
3. **Document Decisions**: Future agents need context
4. **Ask Questions**: Better to clarify than assume
5. **Update Trackers**: Keep them current for smooth handoffs
6. **Use Worktrees**: Work in isolation to avoid conflicts
7. **Review PRs**: Check other agents' work when requested
8. **Clean Up**: Remove worktrees after merging to main

---

*Last Updated: 2025-01-03*
*Maintained by: Project Agents*

## Appendix: Resolving Common Git Worktree Issues

### Issue: "Cannot create worktree - branch already exists"
**Solution**: Use a different branch name or checkout existing branch
```bash
# Option 1: Use existing branch
git worktree add ../wt/feature feature/existing-branch

# Option 2: Create with new branch name
git worktree add ../wt/feature -b feature/new-name
```

### Issue: "Fatal: not a valid git repository"
**Solution**: Ensure you're in the main repository directory
```bash
cd /path/to/spacetimedb/initial
git worktree add ../initial-worktrees/my-feature -b feature/name
```

### Issue: Merge conflicts when syncing
**Solution**: Resolve conflicts in your worktree
```bash
git fetch origin
git rebase origin/main
# Fix conflicts, then:
git add .
git rebase --continue
```

### Issue: Worktree directory already exists
**Solution**: Remove the directory or use a different name
```bash
rm -rf ../initial-worktrees/old-feature
# Or use a different path
git worktree add ../initial-worktrees/feature-v2 -b feature/name
```