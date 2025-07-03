# Contributing to Documentation

This guide outlines the standard operating procedures (SOPs) for maintaining and contributing to the SpacetimeDB + Svelte + Claude Code documentation.

## 📋 Table of Contents

1. [When to Update Documentation](#when-to-update-documentation)
2. [Documentation Standards](#documentation-standards)
3. [Agent Guidelines](#agent-guidelines)
4. [File Organization](#file-organization)
5. [Code Reference Format](#code-reference-format)
6. [Review Process](#review-process)
7. [Version Management](#version-management)

## When to Update Documentation

### Immediate Updates Required

- **Bug Fixes**: Document the issue and solution in the appropriate debugging guide
- **Breaking Changes**: Update all affected documentation before merging code
- **New Features**: Create documentation as part of the feature implementation
- **Performance Improvements**: Add to performance guides with before/after metrics

### Regular Updates

- **Weekly**: Review and update code references to ensure accuracy
- **Monthly**: Check for outdated information and deprecated patterns
- **Quarterly**: Comprehensive review of all documentation sections

## Documentation Standards

### Writing Style

1. **Be Concise**: Get to the point quickly
2. **Use Examples**: Show real code from the project, not hypothetical examples
3. **Problem-First**: Start with the problem, then provide the solution
4. **Agent-Friendly**: Use clear headings, bullet points, and structured data

### Markdown Standards

```markdown
# Section Title (H1 - One per file)

Brief introduction paragraph.

## Subsection (H2)

### Details (H3)

- Bullet points for lists
- Use **bold** for emphasis
- Use `inline code` for small snippets

\```typescript
// Code blocks with language specified
const example = "Always include the language";
\```
```

### File Naming

- Use kebab-case: `real-time-sync.md`
- Be descriptive but concise
- No spaces or special characters
- Match the heading inside the file

## Agent Guidelines

### For AI Agents

1. **Context Awareness**: Always check CLAUDE.md before making documentation updates
2. **Cross-Reference**: Link between related documentation sections
3. **Code Accuracy**: Verify code references before documenting
4. **Version Tracking**: Include "Last Updated" timestamps

### Multi-Agent Coordination

When multiple agents work on documentation:

```markdown
<!-- At the top of each file being edited -->
<!-- Agent: Claude-A | Task: Updating SpacetimeDB examples | Started: 2025-01-03 10:00 -->
```

### Handoff Protocol

1. Complete all sections you start
2. Leave clear TODO comments for incomplete work:
   ```markdown
   <!-- TODO: Add example of reducer with row-level security -->
   ```
3. Update the main README.md status table
4. Commit with descriptive message: `docs: Update SpacetimeDB debugging guide`

## File Organization

### Directory Structure Rules

```
DOCS/
├── README.md                    # Always present, navigation hub
├── CONTRIBUTING.md              # This file
├── {technology}/               
│   ├── README.md               # Overview and navigation
│   ├── getting-started.md      # If applicable
│   ├── {topic}.md              # Specific topics
│   └── troubleshooting.md      # If significant issues exist
```

### Creating New Sections

1. Create directory with README.md
2. Update parent README.md with links
3. Follow existing patterns from other sections
4. Include in main DOCS/README.md navigation

## Code Reference Format

### Standard Format

Always reference code with full path and line numbers:

```markdown
The connection is initialized in `client/src/lib/spacetime.ts:16`:

\```typescript
// Include relevant code snippet
\```
```

### Dynamic References

For frequently changing code:

```markdown
The main entry point is in `server/Module.cs` (search for `class StdbModule`).
```

### Breaking Changes

When code structure changes significantly:

1. Update all references in documentation
2. Add migration notes if applicable
3. Keep old references with deprecation notice

## Review Process

### Self-Review Checklist

Before committing documentation:

- [ ] All code examples tested and working
- [ ] Links between documents are valid
- [ ] No typos or grammatical errors
- [ ] Consistent formatting throughout
- [ ] "Last Updated" timestamp added/updated

### Peer Review

1. Request review from team member or agent
2. Address feedback in same PR/commit
3. Update status in README.md after merge

### Regular Audits

Monthly audit checklist:

```markdown
## Documentation Audit - [Month Year]

- [ ] All code references still valid
- [ ] No broken internal links
- [ ] Tool versions still accurate
- [ ] New issues added to troubleshooting
- [ ] Case studies updated with recent learnings
```

## Version Management

### Documenting Versions

Always specify versions in documentation:

```markdown
> **Version Note**: This guide applies to SpacetimeDB 0.8.0+. For earlier versions, see [archived docs].
```

### Breaking Changes

When tools have breaking changes:

1. Create new version-specific documentation
2. Move old docs to archive
3. Update all references
4. Add migration guide

### Version Compatibility Matrix

Maintain in main README.md:

```markdown
| Documentation Version | SpacetimeDB | Svelte | Claude Code |
|----------------------|-------------|--------|-------------|
| 1.0 (Current)        | 0.8.0+      | 5.0+   | Latest      |
| 0.9 (Archive)        | 0.7.x       | 4.x    | 2024.12     |
```

## Standard Templates

### New Feature Documentation

```markdown
# Feature Name

## Overview
Brief description of what this feature does and why it matters.

## Prerequisites
- Required knowledge
- Required setup

## Implementation
Step-by-step guide with code examples.

## Common Issues
Known problems and solutions.

## Best Practices
Recommended patterns.

## References
- Related documentation
- External resources

---
*Last Updated: YYYY-MM-DD by [Author/Agent]*
```

### Troubleshooting Entry

```markdown
### Issue: [Clear problem statement]

**Symptoms**: What the user sees

**Cause**: Root cause explanation

**Solution**: 
\```bash
# Commands or code to fix
\```

**Prevention**: How to avoid this issue

**Related**: Links to relevant docs
```

## Commit Messages

Use conventional commits for documentation:

- `docs: Add SpacetimeDB getting started guide`
- `docs(fix): Correct WebSocket connection example`
- `docs(update): Refresh Svelte 5 migration guide`
- `docs(refactor): Reorganize Claude Code section`

## Questions and Support

- For documentation questions: Create an issue with `docs:` prefix
- For urgent updates: Tag `@documentation-team` in PR
- For major restructuring: Discuss in team meeting first

---

*This contributing guide is a living document. Suggest improvements through the standard PR process.*

*Last Updated: 2025-01-03*