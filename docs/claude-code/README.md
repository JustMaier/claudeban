# Claude Code Documentation

This section documents our experience using Claude Code as an AI-powered development assistant for building applications with SpacetimeDB and Svelte 5.

## 🎯 What is Claude Code?

Claude Code is Anthropic's official CLI tool that brings Claude's capabilities directly into your development workflow:

- **Context-aware assistance** - Understands your entire codebase
- **Multi-file operations** - Can read, write, and modify multiple files
- **Tool integration** - Executes commands, searches code, manages tasks
- **Multi-agent support** - Coordinate multiple AI agents for parallel work

## 📚 Documentation

### Getting Started
- [Agent Workflows](agent-workflows.md) - Single and multi-agent development patterns
- [Multi-Agent Patterns](multi-agent-patterns.md) - Parallel development strategies

### Advanced Usage
- [Context Management](context-management.md) - Working with CLAUDE.md and large codebases
- [Debugging with Claude](debugging-with-claude.md) - AI-assisted troubleshooting
- [Limitations](limitations.md) - Known constraints and workarounds

## 🚀 Quick Examples

### Effective Task Management

From our TODO system (`TODO/README.md:21`):
```markdown
When an agent begins work:
1. Create a Git worktree for your work
2. Open the relevant tracking file in TODO/TRACKING/
3. Update status from ⬜ to 🟦 (In Progress)
4. Add your name and start timestamp
5. Begin working through the checklist
```

### Context File Usage

Our `CLAUDE.md:23` provides instant context:
```markdown
## 🚀 Quick Start (30 seconds to productivity)

1. **Check available work**:
   ```bash
   cat TODO/TRACKING/style-overhaul.md | grep "⬜"
   ```

2. **Claim a task**:
   ```bash
   git worktree add ../initial-worktrees/[your-name]-[feature]
   ```
```

## 🔧 Current Implementation

### Project Organization
- `CLAUDE.md` - Primary context file for AI agents
- `TODO/` - Task tracking and agent coordination
- `DEBUG/` - Issue documentation and solutions
- `DOCS/` - This documentation structure

### Agent Coordination Patterns
- **Git Worktrees** - Parallel development without conflicts
- **Task Tracking** - Clear ownership and progress visibility
- **Handoff Protocols** - Smooth transitions between agents

## ⚡ Key Patterns We Use

1. **Context-First Development**: CLAUDE.md as single source of truth
2. **Explicit Task Management**: TODO system with clear status tracking
3. **Parallel Workflows**: Git worktrees for concurrent development
4. **Incremental Progress**: Frequent commits and status updates
5. **Clear Documentation**: Every decision and issue documented

## 🐛 Common Patterns & Solutions

### 1. Large File Navigation
```bash
# Use search tools effectively
grep -n "pattern" file.ts        # Find with line numbers
rg "reducer" --type ts           # Search TypeScript files
```

### 2. Multi-File Refactoring
```bash
# Plan changes first
1. Search for all occurrences
2. Create TODO list of files to change
3. Make changes systematically
4. Verify with type checking
```

### 3. Context Management
- Keep CLAUDE.md updated with current focus
- Use file:line references for precision
- Document assumptions and decisions

## 📊 Productivity Metrics

From our experience:
- **Code Generation**: 10-50x faster for boilerplate
- **Bug Finding**: Catches patterns humans miss
- **Refactoring**: Handles tedious changes reliably
- **Documentation**: Maintains consistency across files

## 🤝 Human-AI Collaboration

### Best Practices
1. **Clear Instructions**: Specify exactly what you want
2. **Verify Output**: Always review generated code
3. **Incremental Changes**: Small, testable modifications
4. **Context Sharing**: Keep CLAUDE.md current

### Anti-Patterns
- Asking for too much at once
- Not providing enough context
- Skipping verification steps
- Ignoring error messages

## 🔗 Resources

- [Claude Code GitHub](https://github.com/anthropics/claude-code)
- [Official Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Community Examples](https://github.com/anthropics/claude-code/tree/main/examples)

## 🎯 Next Steps

1. Learn [Agent Workflows](agent-workflows.md) for effective usage
2. Master [Multi-Agent Patterns](multi-agent-patterns.md) for team development
3. Understand [Context Management](context-management.md) for large projects
4. Explore [Debugging with Claude](debugging-with-claude.md) for troubleshooting

---

*Last Updated: 2025-01-03*