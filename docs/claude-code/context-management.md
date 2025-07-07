# Claude Code Context Management Guide

## Overview

Effective context management is crucial for productive AI-assisted development. This guide covers strategies for providing Claude Code with the right information at the right time, maximizing its ability to understand and contribute to your project.

## Table of Contents

1. [Understanding Context in Claude Code](#understanding-context)
2. [The CLAUDE.md File](#claude-md-file)
3. [Context Window Management](#context-window-management)
4. [Information Hierarchy](#information-hierarchy)
5. [Dynamic Context Strategies](#dynamic-context-strategies)
6. [Project-Specific Context Files](#project-specific-context-files)
7. [Context for Different Phases](#context-phases)
8. [Templates and Examples](#templates-examples)
9. [Limitations and Workarounds](#limitations-workarounds)
10. [Best Practices](#best-practices)

## Understanding Context in Claude Code {#understanding-context}

Claude Code operates within a context window - a limited amount of information it can process at once. Effective context management means:

- Providing relevant information without overwhelming
- Structuring data for quick comprehension
- Maintaining consistency across sessions
- Adapting context to current tasks

### Key Principles

1. **Relevance Over Volume**: More context isn't always better
2. **Structure for Scanning**: Use clear headers and formatting
3. **Progressive Disclosure**: Layer information by importance
4. **Task-Specific Focus**: Tailor context to current work

## The CLAUDE.md File {#claude-md-file}

The `CLAUDE.md` file serves as the primary context document for AI agents. It should be:

- **Concise**: Essential information only
- **Current**: Regularly updated
- **Actionable**: Focus on what needs doing
- **Navigational**: Point to detailed resources

### Core Structure

```markdown
# Project Name - Agent Instructions

Last Updated: [Date] ([Manual/Auto] - update method)

## <� Current Sprint Focus
[1-2 sentences on immediate priorities]

## =� Project Status
- **Active Phase**: [Current phase/milestone]
- **Recently Completed**: [Last 3-5 achievements]
- **In Progress**: [Active work items]
- **Available Tasks**: [Next available work]

## =� Quick Start
[30-second guide to productivity]

## =� Essential Locations
[Key files and directories]

## =� Key Commands
[Most-used commands with brief descriptions]

## <� What We're Building
[Brief project vision/goals]

## = Development Workflow
[Standard process steps]

## � Current Opportunities
[Immediate work available]

## = Quick Links
[References to detailed docs]
```

### Example: SpacetimeDB Kanban CLAUDE.md

The current CLAUDE.md demonstrates effective practices:

1. **Clear Status Section**: Shows exactly what's done, in progress, and available
2. **Quick Start Guide**: Gets agents productive in 30 seconds
3. **Essential Locations**: Points to key resources without duplicating content
4. **Current Focus**: Phase-based development with clear priorities
5. **Command Reference**: Common operations readily available

## Context Window Management {#context-window-management}

### Understanding Limits

Claude Code has a finite context window. Effective management involves:

1. **Prioritization**: Most important information first
2. **Compression**: Summarize verbose content
3. **Reference**: Link to details rather than include them
4. **Rotation**: Swap context based on current task

### Strategies for Large Codebases

#### 1. Modular Context Files

```
/project-root/
  CLAUDE.md                 # Main entry point
  /.claude/
    /contexts/
      frontend.md          # Frontend-specific context
      backend.md           # Backend-specific context
      database.md          # Database schema/patterns
      testing.md           # Test strategies
    /commands/             # Custom command definitions
    /templates/            # Reusable templates
```

#### 2. Progressive Loading

Start with high-level context, then load specifics:

```markdown
## Quick Context Load Sequence

1. Read CLAUDE.md (always)
2. Check current task in docs/todo/TRACKING/
3. Load relevant context file from .claude/contexts/
4. Read specific code files for task
```

#### 3. Context Switching

Use task-specific context files:

```markdown
# .claude/contexts/frontend.md

## Frontend Development Context

### Tech Stack
- Svelte 5 with runes
- TypeScript
- Vite
- SpacetimeDB SDK

### Key Patterns
- Store pattern: `src/lib/stores/`
- Component structure: `src/lib/components/`
- Route handling: `src/routes/`

### Current Issues
- [List active frontend issues]

### Reference Commands
```bash
npm run dev        # Start dev server
npm run check      # Type checking
npm run build      # Production build
```
```

## Information Hierarchy {#information-hierarchy}

### Level 1: Project Overview (CLAUDE.md)
- Current sprint focus
- Available tasks
- Quick start guide
- Essential locations

### Level 2: Domain Context (.claude/contexts/)
- Technology-specific patterns
- Architecture decisions
- Common operations
- Known issues

### Level 3: Task Context (docs/todo/TRACKING/)
- Specific requirements
- Dependencies
- Acceptance criteria
- Implementation notes

### Level 4: Code Context (actual files)
- Implementation details
- Comments and documentation
- Tests and examples

## Dynamic Context Strategies {#dynamic-context-strategies}

### 1. Task-Based Context Loading

```markdown
# Task: Implement Dark Mode

## Relevant Context Files
1. CLAUDE.md - Current status
2. .claude/contexts/theming.md - Theme patterns
3. docs/todo/TRACKING/style-overhaul.md - Requirements
4. client/src/lib/stores/theme-store.svelte.ts - Current implementation

## Key Information
- Using shadcn-svelte for components
- Theme stored in User table
- Need real-time sync across sessions
```

### 2. Phase-Based Context

Different development phases require different context:

```markdown
# .claude/contexts/phase-planning.md
- Focus on requirements and architecture
- Include user stories and acceptance criteria
- Reference existing similar implementations

# .claude/contexts/phase-implementation.md
- Focus on code patterns and conventions
- Include API references and examples
- Reference test requirements

# .claude/contexts/phase-testing.md
- Focus on test strategies and coverage
- Include test data and scenarios
- Reference CI/CD requirements
```

### 3. Role-Based Context

```markdown
# .claude/contexts/architect.md
- System design patterns
- Technology decisions
- Integration points
- Performance considerations

# .claude/contexts/developer.md
- Coding standards
- Common patterns
- Development workflow
- Debugging tips
```

## Project-Specific Context Files {#project-specific-context-files}

### Structure Template

```markdown
# [Domain] Context

## Overview
[1-2 sentence description]

## Key Concepts
- [Concept 1]: [Brief explanation]
- [Concept 2]: [Brief explanation]

## Common Patterns
### [Pattern Name]
```[language]
// Example code
```

## Gotchas & Solutions
1. **Issue**: [Description]
   **Solution**: [How to handle]

## Resources
- [Internal doc]: [Path]
- [External ref]: [URL]

## Commands & Operations
```bash
# Common command 1
# Common command 2
```
```

### Example: Database Context

```markdown
# Database Context

## Overview
SpacetimeDB tables and relationships for the Kanban application.

## Key Concepts
- **Row-Level Security**: Visibility filters on queries
- **Reducers**: Server-side functions for data manipulation
- **Subscriptions**: Real-time data sync

## Schema Overview
- `User`: Identity and preferences
- `Board`: Project containers
- `Card`: Task items
- `Collaborator`: Board access control
- `Metric`: Time tracking data

## Common Patterns
### Creating with Relations
```csharp
[Reducer]
public static void CreateCard(ReducerContext ctx, uint boardId, string title) {
    var board = ctx.Db.Board.FindByBoardId(boardId);
    if (board == null) throw new ArgumentException("Board not found");
    
    new Card {
        BoardId = boardId,
        Title = title,
        CreatedBy = ctx.Sender,
        CreatedAt = ctx.Timestamp
    }.Insert();
}
```

## Gotchas & Solutions
1. **Issue**: Subscription filters are global
   **Solution**: Use visibility filters in table definitions

## Commands & Operations
```bash
# Rebuild and publish server
spacetime publish --project-path server kanban-plus

# Check server logs
spacetime logs kanban-plus
```
```

## Context for Different Phases {#context-phases}

### 1. Discovery Phase

```markdown
# Discovery Context

## Research Questions
- [ ] What similar solutions exist?
- [ ] What are the technical constraints?
- [ ] Who are the stakeholders?

## Information Sources
- Product requirements: /docs/requirements.md
- User research: /docs/user-research/
- Technical constraints: /docs/architecture/constraints.md

## Key Decisions Needed
1. Technology stack
2. Architecture pattern
3. Development timeline
```

### 2. Implementation Phase

```markdown
# Implementation Context

## Current Sprint
- Sprint 3: Frontend Components
- Focus: Card management UI

## Development Guidelines
- Code style: /docs/style-guide.md
- Git workflow: /docs/git-workflow.md
- Review process: /docs/code-review.md

## Active Features
1. Drag-and-drop cards
2. Real-time updates
3. Keyboard shortcuts

## Dependencies
- shadcn-svelte: v0.9.0
- SpacetimeDB SDK: v1.0.0
```

### 3. Maintenance Phase

```markdown
# Maintenance Context

## System Health
- Uptime: 99.9% last 30 days
- Active users: 1,234
- Database size: 2.3 GB

## Common Issues
1. Websocket disconnections
   - Frequency: 2-3 per day
   - Resolution: Auto-reconnect implemented

2. Card sync delays
   - Frequency: Rare
   - Resolution: Optimistic UI updates

## Monitoring
- Logs: spacetime logs kanban-plus
- Metrics: /admin/metrics
- Alerts: PagerDuty integration
```

## Templates and Examples {#templates-examples}

### 1. New Feature Context Template

```markdown
# Feature: [Feature Name]

## Objective
[What we're trying to achieve]

## Requirements
- [ ] Functional requirement 1
- [ ] Functional requirement 2
- [ ] Non-functional requirement

## Technical Approach
1. [Step 1]
2. [Step 2]

## Files to Modify
- `path/to/file1.ts` - [What to change]
- `path/to/file2.svelte` - [What to change]

## Testing Strategy
- Unit tests: [What to test]
- Integration tests: [What to test]
- Manual testing: [Scenarios]

## Rollout Plan
1. Feature flag implementation
2. Beta user testing
3. General availability
```

### 2. Bug Fix Context Template

```markdown
# Bug: [Issue Title]

## Symptoms
- User reports: [What users see]
- System behavior: [What's happening]
- Frequency: [How often]

## Root Cause
[Technical explanation]

## Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [Observe issue]

## Proposed Fix
```[language]
// Code changes needed
```

## Test Cases
- [ ] Original issue resolved
- [ ] No regression in [related feature]
- [ ] Performance impact acceptable
```

### 3. Refactoring Context Template

```markdown
# Refactoring: [Component/Module Name]

## Motivation
- Current issues: [Problems with existing code]
- Benefits: [Expected improvements]

## Scope
- Files affected: [List]
- Breaking changes: [Yes/No - details]
- Migration needed: [Yes/No - details]

## Approach
1. [Refactoring step 1]
2. [Refactoring step 2]

## Safety Checks
- [ ] All tests passing
- [ ] No functionality changed
- [ ] Performance benchmarked
- [ ] Code reviewed
```

## Limitations and Workarounds {#limitations-workarounds}

### Common Limitations

1. **Context Window Size**
   - **Limitation**: Can't load entire large codebases
   - **Workaround**: Use focused context loading and references

2. **Session Persistence**
   - **Limitation**: Context resets between sessions
   - **Workaround**: Maintain CLAUDE.md and context files

3. **Dynamic State**
   - **Limitation**: Can't track runtime state
   - **Workaround**: Use logging and state dumps

### Effective Workarounds

#### 1. Context Chaining

```markdown
## Context Chain for Complex Tasks

1. Start with CLAUDE.md
2. Load task-specific context
3. Read relevant code files
4. Execute exploratory commands
5. Build mental model
6. Implement solution
```

#### 2. Summary Documents

Create summaries for large components:

```markdown
# Component Summary: CardManager

## Purpose
Manages card CRUD operations and real-time sync

## Key Files
- `card-store.svelte.ts` - State management
- `CardList.svelte` - Display component
- `CardEditor.svelte` - Edit interface

## Dependencies
- SpacetimeDB for persistence
- Svelte stores for reactivity
- DnD library for drag-drop

## Common Operations
1. Create card: `cardStore.create(title, boardId)`
2. Update card: `cardStore.update(id, changes)`
3. Delete card: `cardStore.delete(id)`
```

#### 3. Command Aliases

Create shortcuts for context loading:

```markdown
# .claude/commands/load-frontend.md

Load frontend development context:
1. Read CLAUDE.md
2. Read .claude/contexts/frontend.md
3. List client/src/lib/ structure
4. Show recent frontend commits
```

## Best Practices {#best-practices}

### 1. Keep Context Fresh

- Update CLAUDE.md after each sprint
- Archive old context to .claude/archive/ directory
- Use automated scripts where possible

### 2. Structure for Scanning

- Use clear headers and sections
- Employ bullet points for lists
- Include code examples sparingly
- Highlight key information with **bold**

### 3. Progressive Disclosure

- Start with overview
- Provide details on demand
- Link to comprehensive docs
- Avoid redundancy

### 4. Task-Specific Loading

- Create focused context files
- Load only what's needed
- Reference rather than duplicate
- Clean up after task completion

### 5. Maintain Consistency

- Use standard templates
- Follow naming conventions
- Keep similar structure across files
- Regular maintenance schedule

### 6. Optimize for AI Comprehension

- Clear, unambiguous language
- Logical flow of information
- Explicit rather than implicit
- Examples over abstractions

### 7. Version Control Integration

```bash
# Track context files
git add CLAUDE.md .claude/

# Commit context updates
git commit -m "Update context for sprint 3"

# Tag stable context versions
git tag context-v1.0
```

## Example Workflow

Here's a complete workflow for managing context in a typical development session:

```markdown
## Session: Implement Card Sorting

### 1. Initial Context Load
- Read CLAUDE.md
- Check docs/todo/TRACKING/style-overhaul.md
- Load .claude/contexts/frontend.md

### 2. Gather Requirements
- Read task description
- Check dependencies
- Review similar implementations

### 3. Explore Codebase
- List relevant directories
- Read current implementation
- Identify modification points

### 4. Plan Implementation
- Create implementation notes
- Document approach
- List files to modify

### 5. Execute Changes
- Make code changes
- Run tests
- Verify functionality

### 6. Update Context
- Mark task complete
- Update CLAUDE.md if needed
- Document any new patterns
```

## Conclusion

Effective context management is an ongoing process that requires:

- Regular maintenance and updates
- Clear structure and organization  
- Task-appropriate information loading
- Continuous refinement based on usage

By following these guidelines, you can maximize Claude Code's effectiveness and maintain productive AI-assisted development sessions across your project lifecycle.

Remember: The goal is not to provide all possible context, but to provide the right context at the right time.