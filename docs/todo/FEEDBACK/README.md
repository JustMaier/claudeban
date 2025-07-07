# Review Feedback

This directory contains feedback from human reviewers after testing features. Agents should check here for feedback on their completed work.

## How It Works

### For Reviewers
1. Complete the checklist in `TODO/REVIEW/[feature].md`
2. Create `TODO/FEEDBACK/[feature].md` with your findings
3. Use the template below
4. Be specific about issues and reproduction steps

### For Agents
1. Check for feedback files matching your completed features
2. Read and understand all feedback
3. Address "Must fix" items first
4. Update the feedback file with resolution notes
5. Request re-review if needed

## Feedback Template

```markdown
# [Feature Name] Review Feedback

**Date**: YYYY-MM-DD
**Reviewer**: [Name/Handle]
**Review Checklist**: TODO/REVIEW/[feature].md

## ✅ What Works Well
- [List things that work as expected]
- [Highlight particularly good implementations]

## ❌ Issues Found

### Issue 1: [Brief Description]
- **What happened**: [Detailed description]
- **Expected**: [What should have happened]
- **Steps to reproduce**:
  1. [Step 1]
  2. [Step 2]
- **Error/Log**: [Any error messages]

### Issue 2: [Brief Description]
- [Follow same format]

## 💡 Suggestions (Optional)
- [Improvements that aren't bugs]
- [Better ways to implement]
- [UX enhancements]

## 🎯 Priority
- [ ] **Must Fix**: Blocking issues that prevent feature from working
- [ ] **Should Fix**: Important but not blocking
- [ ] **Nice to Have**: Improvements for later

## 📝 Agent Response
[Agents: Add your response here]
- [ ] Issue 1: [How you fixed it]
- [ ] Issue 2: [Status/Plan]

## ✅ Re-Review Status
- [ ] Ready for re-review
- [ ] All issues addressed
- **Date**: [When fixes completed]
```

## Best Practices

### For Reviewers
1. **Be Specific**: Include exact commands and error messages
2. **Stay Constructive**: Focus on the work, not the worker
3. **Prioritize**: Clearly mark what must be fixed vs nice-to-have
4. **Include Positives**: Acknowledge what works well

### For Agents
1. **Don't Take It Personally**: Feedback improves the project
2. **Ask Questions**: If feedback unclear, request clarification
3. **Document Fixes**: Note how you addressed each issue
4. **Test Thoroughly**: Verify fixes before requesting re-review

## Active Feedback
- Check individual `.md` files for feature-specific feedback