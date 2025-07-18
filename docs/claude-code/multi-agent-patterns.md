# Multi-Agent Development Patterns for Claude Code

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Architecture Patterns](#architecture-patterns)
4. [Worktree Strategies](#worktree-strategies)
5. [Communication Protocols](#communication-protocols)
6. [Task Distribution](#task-distribution)
7. [Conflict Prevention](#conflict-prevention)
8. [Monitoring & Coordination](#monitoring--coordination)
9. [Real-World Examples](#real-world-examples)
10. [Templates & Checklists](#templates--checklists)

## Introduction

Multi-agent development with Claude Code enables teams to parallelize complex projects efficiently. This guide documents proven patterns for coordinating multiple AI agents working on the same codebase, based on real implementations in the SpacetimeDB project.

### Key Benefits
- **Parallel Development**: Multiple agents work simultaneously on different features
- **Reduced Conflicts**: Git worktrees isolate changes
- **Clear Communication**: Structured tracking and handoff protocols
- **Scalable Teams**: From 2 to 5+ agents working in harmony

## Core Concepts

### Agent Types

1. **Lead Agent**: Coordinates work, reviews PRs, manages dependencies
2. **Feature Agents**: Implement specific features in isolated branches
3. **Support Agents**: Handle infrastructure, testing, documentation
4. **Specialist Agents**: Focus on specific technologies (UI, backend, etc.)

### Work States

```
 Not Started    - Task awaiting assignment
=� In Progress    - Agent actively working
 Completed      - Task finished and tested
L Blocked        - Requires intervention
� Paused         - Temporarily halted
```

## Architecture Patterns

### 1. Sequential-Parallel Hybrid

Best for projects with dependency chains and parallel opportunities.

```
Phase 1: Infrastructure (1 Agent)      �
                                        
Phase 2: Core Systems (2 Agents) �      
           Agent A: Theme System      �
           Agent B: Components        �
                                        
Phase 3: Features (5 Agents) �          
           Agent A: User Components
           Agent B: Action Components
           Agent C: Board Components
           Agent D: Drag & Drop
           Agent E: Search & Command
```

**When to Use**:
- Complex projects with clear phases
- Mixed sequential and parallel work
- Well-defined dependencies

### 2. Feature Branch Pattern

Each agent owns a feature from start to finish.

```
main
    feature/theme-system (Agent A)
    feature/drag-drop (Agent B)
    feature/notifications (Agent C)
    feature/mobile-ui (Agent D)
```

**When to Use**:
- Independent features
- Minimal cross-feature dependencies
- Teams of 3-8 agents

### 3. Component Ownership Pattern

Agents specialize in specific components or layers.

```
Frontend Agent: All UI components
Backend Agent: Server reducers and models
Infrastructure Agent: Build, deploy, tooling
Testing Agent: Test suites and CI
```

**When to Use**:
- Clear architectural boundaries
- Specialized skill requirements
- Long-running projects

## Worktree Strategies

### Basic Worktree Setup

```bash
# Directory structure
spacetimedb/
   initial/                    # Main repository
      .git/                  # Shared git database
      [project files]
   initial-worktrees/
       agent-a-theme/         # Agent A's workspace
       agent-b-components/    # Agent B's workspace
       agent-c-features/      # Agent C's workspace
```

### Creating Agent Worktrees

```bash
# From main repository
cd /path/to/project/initial

# Create worktree for specific feature
git worktree add ../initial-worktrees/agent-[name]-[feature] -b feature/[name]

# Example
git worktree add ../initial-worktrees/agent-alice-theme -b feature/theme-system
```

### Worktree Lifecycle

1. **Creation**: When agent starts feature
2. **Active Development**: Regular commits in isolation
3. **Integration**: PR creation and review
4. **Cleanup**: Remove after merge

```bash
# List active worktrees
git worktree list

# Remove completed worktree
git worktree remove ../initial-worktrees/agent-alice-theme

# Prune deleted references
git worktree prune
```

### Advanced Strategies

#### 1. Temporary Investigation Worktrees

For exploring without committing:

```bash
git worktree add ../temp/investigation --detach
# Explore freely
git worktree remove ../temp/investigation
```

#### 2. Hotfix Worktrees

For urgent fixes while preserving current work:

```bash
git worktree add ../hotfix/critical-bug -b hotfix/issue-123
# Fix and merge quickly
```

#### 3. Review Worktrees

For reviewing other agents' PRs:

```bash
git worktree add ../review/pr-456 origin/feature/other-agent
# Review and test
```

## Communication Protocols

### 1. Tracking Document Protocol

Every major feature has a tracking document in `TODO/TRACKING/`:

```markdown
## Phase 2: Core Systems (2 Agents Parallel)

### Agent A: Theme System
**Status**: =� In Progress
**Assigned**: Agent Alice
**Started**: 2025-01-03 10:00
**Dependencies**: Phase 1 complete

#### Tasks:
1.  **Create theme-store.svelte.ts**
   - [x] Define ThemeConfig interface
   - [x] Implement 12 primary colors
   - **Files Created**: client/src/lib/stores/theme-store.svelte.ts
   - **Notes**: Using HSL for easy manipulation

2. =� **ThemeProvider Component**
   - [x] Create ThemeProvider.svelte
   - [ ] Implement CSS variable updates
   - **Blocker**: Need design decision on default theme
```

### 2. Handoff Protocol

When transferring work between agents:

```markdown
## Handoff Notes - Theme System

**From**: Agent Alice
**To**: Agent Bob
**Date**: 2025-01-03 15:00

### Completed:
- Theme store with 12 color options
- Basic ThemeProvider component
- Color manipulation utilities

### Remaining:
- CSS variable integration
- Mode-watcher setup
- Theme persistence

### Key Decisions:
- Using HSL for colors (easier manipulation)
- Storing theme in both localStorage and DB
- Primary colors generate complementary automatically

### Known Issues:
- Safari needs fallback for color-mix()
- Dark mode contrast needs adjustment

### Next Steps:
1. Complete ThemeProvider CSS updates
2. Test with existing components
3. Create ThemeSwitcher UI
```

### 3. PR Communication

Structured PR descriptions:

```markdown
## Summary
- Implements complete theme system for application
- Adds 12 primary color options with dark/light modes
- Includes automatic complementary color generation

## Changes
- Add: `theme-store.svelte.ts` - Theme state management
- Add: `ThemeProvider.svelte` - CSS variable provider
- Add: `ThemeSwitcher.svelte` - UI controls
- Update: User model with theme preferences

## Testing
- [x] Tested all 12 colors in light/dark modes
- [x] Verified localStorage persistence
- [x] Checked database sync
- [x] Mobile responsive

## Dependencies
- Requires Phase 1 infrastructure complete
- No breaking changes to existing components

## Next Agent Tasks
- Agent C can now implement themed components
- Agent D can add theme to user settings
```

## Task Distribution

### 1. Dependency-Based Distribution

Map dependencies and assign accordingly:

```yaml
Phase 1: Infrastructure
  Agents: 1
  Tasks:
    - shadcn setup
    - Model updates
    - New reducers
  
Phase 2: Core Systems
  Agents: 2
  Parallel Tasks:
    Agent A: Theme system (no deps)
    Agent B: Component library (no deps)
    
Phase 3: Components
  Agents: 5
  Dependencies:
    Agent A: Needs Avatar from Phase 2B
    Agent B: Needs Button, Skeleton from Phase 2B
    Agent C: Needs Badge, Avatar from Phase 2B
    Agent D: Needs position field from Phase 1
    Agent E: Needs Command from Phase 2B
```

### 2. Skill-Based Distribution

Assign based on agent strengths:

```yaml
UI Specialist Agents:
  - Theme system
  - Component library
  - Mobile responsive
  
Backend Specialist Agents:
  - Database models
  - Reducers
  - Real-time sync
  
Full-Stack Agents:
  - Feature implementation
  - Integration work
  - Bug fixes
```

### 3. Load Balancing

Monitor and redistribute as needed:

```python
# Pseudo-code for load distribution
agents = {
    "Alice": {"capacity": 3, "current": 2},
    "Bob": {"capacity": 2, "current": 2},
    "Carol": {"capacity": 4, "current": 1}
}

def assign_task(task, priority):
    # Find agent with most available capacity
    available = [(name, data["capacity"] - data["current"]) 
                 for name, data in agents.items()]
    best_agent = max(available, key=lambda x: x[1])
    
    if best_agent[1] > 0:
        assign_to_agent(best_agent[0], task)
    else:
        queue_task(task, priority)
```

## Conflict Prevention

### 1. File-Level Isolation

Organize code to minimize overlap:

```
client/src/
   lib/
      components/     # Agent A domain
      stores/        # Agent B domain
      utils/         # Shared (coordinate changes)
   routes/           # Agent C domain
   styles/          # Agent D domain
```

### 2. Import Management

Use barrel exports to reduce conflicts:

```typescript
// lib/components/index.ts (managed by Agent A)
export { UserDisplay } from './UserDisplay.svelte';
export { UserAvatar } from './UserAvatar.svelte';
export { LoadingButton } from './LoadingButton.svelte';

// Other agents import from barrel
import { UserDisplay, LoadingButton } from '$lib/components';
```

### 3. Schema Coordination

Coordinate database changes:

```csharp
// Coordinate through tracking document before implementing
// Agent A adds in Phase 1:
public partial class Card {
    public int Position { get; set; }
}

// Agent B waits for Phase 1 completion before using Position
```

### 4. Style Isolation

Use scoped styles and naming conventions:

```css
/* Component-specific classes */
.theme-switcher-root { }
.theme-switcher-dropdown { }

/* Shared utility classes from Tailwind */
class="flex items-center gap-2"
```

## Monitoring & Coordination

### 1. Progress Dashboard

Create a central monitoring view:

```markdown
# Project Status Dashboard

## Overall Progress: 35%

### Active Agents (3/5)
- =� Alice: Theme System (Phase 2A) - 60% complete
- =� Bob: Components (Phase 2B) - 40% complete
- =� Carol: Drag & Drop (Phase 3D) - 20% complete
-  David: Idle (awaiting Phase 3)
-  Eve: Idle (awaiting Phase 3)

### Blocked Tasks (1)
- L User Components: Waiting for Avatar component

### Recent Completions
-  Infrastructure setup (Phase 1)
-  Database schema updates
-  TypeScript bindings

### Upcoming Milestones
- [ ] Phase 2 completion (2 days)
- [ ] Phase 3 start (3 days)
- [ ] First integration test (5 days)
```

### 2. Daily Sync Protocol

Quick status updates in tracking:

```markdown
## Daily Status - 2025-01-03

### Alice (Theme System)
- Completed: Theme store, color utilities
- Today: ThemeProvider integration
- Blockers: None
- ETA: Tomorrow

### Bob (Components)
- Completed: 8/13 components installed
- Today: Remaining 5 components
- Blockers: shadcn-svelte version issue (resolved)
- ETA: End of day

### Carol (Planning)
- Reviewing Phase 3 requirements
- Preparing worktree for drag-drop
- Ready to start when Phase 2B completes
```

### 3. Dependency Tracking

Maintain clear dependency graph:

```mermaid
graph TD
    A[Phase 1: Infrastructure] --> B[Phase 2A: Theme]
    A --> C[Phase 2B: Components]
    C --> D[Phase 3A: User Components]
    C --> E[Phase 3B: Action Components]
    C --> F[Phase 3C: Board Components]
    A --> G[Phase 3D: Drag & Drop]
    C --> H[Phase 3E: Search]
    B --> I[Phase 4: UI Refactor]
    G --> I
```

## Real-World Examples

### Example 1: SpacetimeDB Style Overhaul

This project demonstrates the sequential-parallel hybrid pattern:

**Team Size**: 5 agents maximum  
**Duration**: 5 phases  
**Parallelization**: Up to 5 agents in Phase 3

**Key Success Factors**:
1. Clear phase dependencies
2. Detailed task checklists
3. Component ownership boundaries
4. Regular status updates

### Example 2: Rapid Feature Development

**Scenario**: Add 3 independent features in 2 days

```bash
# Three agents, three features, zero conflicts
git worktree add ../wt/notifications -b feature/notifications
git worktree add ../wt/search -b feature/search  
git worktree add ../wt/shortcuts -b feature/shortcuts

# Each agent works independently
# PRs can be merged in any order
```

### Example 3: Emergency Hotfix

**Scenario**: Critical bug while 4 agents working on features

```bash
# Lead agent creates hotfix worktree
git worktree add ../hotfix/critical -b hotfix/prod-issue

# Fix issue without disrupting feature work
# Merge to main
# Other agents rebase on updated main
```

## Templates & Checklists

### New Feature Template

```markdown
# [Feature Name] - Implementation Tracker

## Overview
Brief description of the feature and its value.

## Agent Assignment
**Lead**: [Name]
**Support**: [Names]
**Started**: [Date]
**Target**: [Date]

## Dependencies
- [ ] Requires: [Component/Phase]
- [ ] Blocks: [Component/Phase]

## Tasks
### Phase 1: Setup
1.  **Task Name**
   - [ ] Subtask 1
   - [ ] Subtask 2
   - **Files**: 
   - **Notes**:

### Phase 2: Implementation
[Tasks...]

### Phase 3: Testing
[Tasks...]

## Handoff Notes
[To be filled when handing off]

## Known Issues
[Track problems as discovered]
```

### Agent Onboarding Checklist

```markdown
## New Agent Onboarding - [Agent Name]

### Environment Setup
- [ ] Git configured
- [ ] Repository cloned
- [ ] Node.js 20+ installed
- [ ] SpacetimeDB CLI installed
- [ ] Editor configured

### Project Orientation
- [ ] Read TODO/README.md
- [ ] Review active tracking documents
- [ ] Understand dependency graph
- [ ] Check assigned tasks

### Worktree Setup
- [ ] Create feature branch
- [ ] Set up worktree
- [ ] Verify build works
- [ ] Make test commit

### Communication
- [ ] Understand status indicators
- [ ] Know handoff protocol
- [ ] Review PR standards
- [ ] Update tracking document
```

### PR Review Checklist

```markdown
## PR Review - [Feature Name]

### Code Quality
- [ ] No linting errors
- [ ] Types are correct
- [ ] Tests pass
- [ ] No console.logs

### Integration
- [ ] Merges cleanly with main
- [ ] Dependencies documented
- [ ] Breaking changes noted
- [ ] Migration steps included

### Documentation
- [ ] Tracking doc updated
- [ ] Handoff notes complete
- [ ] Known issues documented
- [ ] Next steps clear

### Testing
- [ ] Manual testing complete
- [ ] Edge cases considered
- [ ] Mobile tested (if applicable)
- [ ] Performance acceptable
```

### Conflict Resolution Checklist

```markdown
## Merge Conflict Resolution

### Before Starting
- [ ] Pull latest main
- [ ] Understand both changes
- [ ] Contact other agent if needed

### During Resolution
- [ ] Preserve both functionalities
- [ ] Test thoroughly
- [ ] Document resolution approach

### After Resolution
- [ ] Run all tests
- [ ] Manual testing
- [ ] Update tracking docs
- [ ] Notify affected agents
```

## Best Practices Summary

1. **Always Use Worktrees**: Isolation prevents conflicts
2. **Update Tracking First**: Before coding, update status
3. **Communicate Changes**: Especially breaking changes
4. **Test Before Marking Complete**: Ensure quality
5. **Clean Up After Merge**: Remove old worktrees
6. **Document Decisions**: Future agents need context
7. **Respect Boundaries**: Stay in assigned domains
8. **Ask When Uncertain**: Better to clarify than assume

## Conclusion

Multi-agent development with Claude Code can dramatically accelerate project delivery when properly coordinated. The key is clear communication, proper isolation through git worktrees, and well-defined boundaries between agents.

By following these patterns, teams can scale from 2 to 10+ agents while maintaining code quality and minimizing conflicts. The SpacetimeDB project demonstrates these patterns in action, with 5 agents working in parallel during peak phases.

Remember: The goal is not just parallel work, but coordinated progress toward a unified vision.