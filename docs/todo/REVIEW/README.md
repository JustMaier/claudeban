# Review Checklists

This directory contains review checklists created by agents when they complete features. Each checklist should take no more than 5 minutes to complete.

## How to Use (For Reviewers)

1. Find the checklist for the feature you're reviewing
2. Follow the steps in order
3. Check off items as you complete them
4. If issues found, create feedback in `TODO/FEEDBACK/[feature].md`
5. Let the agent know review is complete

## Checklist Template

When creating a review checklist, use this template:

```markdown
# [Feature Name] Review Checklist

## Quick Test (~5 min)

### 1. Setup (1 min)
- [ ] [Simple setup command or steps]
- [ ] Verify service/feature is running

### 2. Core Functionality (2 min)
- [ ] Test primary feature works
- [ ] Check UI displays correctly (if applicable)
- [ ] Verify data persists/syncs

### 3. Edge Cases (1 min)
- [ ] Test error handling
- [ ] Check boundary conditions
- [ ] Verify graceful failures

### 4. Cleanup (30 sec)
- [ ] Stop services
- [ ] Note any cleanup needed

## Expected Results
- **Should see**: [Describe expected behavior]
- **Should NOT see**: [Common issues to watch for]

## Common Issues
- [List potential problems and solutions]

## Next Steps
If issues found, check `TODO/FEEDBACK/[feature].md` for details
```

## Best Practices

1. **Keep it Simple**: 5 minutes max for the entire review
2. **Be Specific**: Exact commands and expected outputs
3. **Visual Aids**: Include screenshot names if applicable
4. **Focus on Core**: Test the main feature, not every detail
5. **Clear Success Criteria**: Reviewer should know when it passes

## Current Reviews

- `docker.md` - Docker development environment