# SpacetimeDB + Svelte + Claude Code Documentation

Welcome to the comprehensive documentation for building real-time applications with SpacetimeDB, Svelte 5, and Claude Code. This documentation captures our experience building a "Kanban-Plus" application and provides practical guidance for teams using this technology stack.

## 🚀 Quick Start

### By Role

- **Developers**: Start with [SpacetimeDB Getting Started](spacetimedb/getting-started.md) → [Svelte Runes](svelte/runes-and-reactivity.md) → [Integration Patterns](integration/real-time-sync.md)
- **Architects**: Review [SpacetimeDB Architecture](spacetimedb/architecture.md) → [Integration Overview](integration/README.md) → [Case Studies](case-studies/README.md)
- **AI/Agent Users**: Begin with [Claude Code Overview](claude-code/README.md) → [Agent Workflows](claude-code/agent-workflows.md) → [Multi-Agent Patterns](claude-code/multi-agent-patterns.md)

### By Task

- **Setting up a new project**: [SpacetimeDB Getting Started](spacetimedb/getting-started.md) + [Development Workflow](integration/development-workflow.md)
- **Debugging issues**: [SpacetimeDB Debugging](spacetimedb/debugging.md) + [Debugging with Claude](claude-code/debugging-with-claude.md)
- **Optimizing performance**: [Svelte Performance](svelte/performance.md) + [Performance Case Study](case-studies/performance-optimization.md)

## 📚 Documentation Structure

### [SpacetimeDB](spacetimedb/README.md)
Learn about the real-time database that powers our application.

- [Getting Started](spacetimedb/getting-started.md) - Installation and basic setup
- [Architecture](spacetimedb/architecture.md) - How SpacetimeDB works under the hood
- [Reducers and Tables](spacetimedb/reducers-and-tables.md) - Core programming model
- [Client SDK](spacetimedb/client-sdk.md) - TypeScript SDK patterns and usage
- [Debugging](spacetimedb/debugging.md) - Common issues and solutions
- [Best Practices](spacetimedb/best-practices.md) - Patterns and anti-patterns

### [Svelte](svelte/README.md)
Master Svelte 5's new reactivity system and integration patterns.

- [Runes and Reactivity](svelte/runes-and-reactivity.md) - Understanding $state, $derived, and more
- [Stores Pattern](svelte/stores-pattern.md) - Our store architecture explained
- [Component Patterns](svelte/component-patterns.md) - Building reusable components
- [State Management](svelte/state-management.md) - Integrating with SpacetimeDB
- [Performance](svelte/performance.md) - Optimization techniques

### [Claude Code](claude-code/README.md)
Leverage AI-powered development effectively.

- [Agent Workflows](claude-code/agent-workflows.md) - Single and multi-agent patterns
- [Multi-Agent Patterns](claude-code/multi-agent-patterns.md) - Parallel development strategies
- [Context Management](claude-code/context-management.md) - Working with large codebases
- [Debugging with Claude](claude-code/debugging-with-claude.md) - AI-assisted troubleshooting
- [Limitations](claude-code/limitations.md) - Known constraints and workarounds

### [Integration](integration/README.md)
Learn how these technologies work together seamlessly.

- [Real-Time Sync](integration/real-time-sync.md) - Live data synchronization patterns
- [Type Safety](integration/type-safety.md) - End-to-end type safety strategies
- [Development Workflow](integration/development-workflow.md) - Local development setup
- [Deployment](integration/deployment.md) - Production considerations

### [Case Studies](case-studies/README.md)
Real-world experiences and lessons learned.

- [Kanban Implementation](case-studies/kanban-implementation.md) - Our project's journey
- [Performance Optimization](case-studies/performance-optimization.md) - Solving real issues
- [Lessons Learned](case-studies/lessons-learned.md) - Key insights and takeaways

## 🛠️ Tool Versions

This documentation is based on:
- **SpacetimeDB**: 0.8.0
- **Svelte**: 5.0.0
- **Claude Code**: Latest (as of January 2025)
- **Node.js**: 18+
- **TypeScript**: 5.0+

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on maintaining and updating this documentation.

## 🔍 Finding Information

### Common Issues

- **State mutation errors**: See [Svelte State Management](svelte/state-management.md#mutation-errors)
- **WebSocket connection issues**: See [SpacetimeDB Debugging](spacetimedb/debugging.md#connection-issues)
- **Type generation problems**: See [Type Safety](integration/type-safety.md#troubleshooting)

### Code References

Throughout the documentation, we reference specific code locations using the format `file:line`. For example:
- `server/Module.cs:45` - Main module entry point
- `client/src/lib/spacetime.ts:16` - Connection initialization

## 📊 Documentation Status

| Section | Status | Last Updated |
|---------|--------|--------------|
| SpacetimeDB | 🟡 In Progress | 2025-01-03 |
| Svelte | 🟡 In Progress | 2025-01-03 |
| Claude Code | 🟡 In Progress | 2025-01-03 |
| Integration | 🟡 In Progress | 2025-01-03 |
| Case Studies | 🟡 In Progress | 2025-01-03 |

Legend: 🟢 Complete | 🟡 In Progress | 🔴 Not Started

---

*This documentation is actively maintained by both human developers and AI agents. For the latest updates, check the git history.*