# Check Review Feedback

Check if there's any feedback on completed features that needs to be addressed.

## Usage
/project:check-feedback [feature-name]

If no feature name provided, checks all feedback files.

## Instructions

1. **List Feedback Files**
   ```bash
   ls TODO/FEEDBACK/*.md | grep -v README
   ```
   - Exclude README.md and example files
   - Note which features have feedback

2. **Check Specific Feature** (if provided)
   - Read `TODO/FEEDBACK/${feature}.md` if it exists
   - If not found, report "No feedback yet"

3. **Check All Feedback** (if no feature specified)
   - For each feedback file found:
     - Extract feature name
     - Check for "Must Fix" items
     - Check if "Ready for re-review" is checked
     - Note agent response status

4. **Summarize Findings**
   ```
   📋 Review Feedback Status
   
   Feature: docker
   - Has feedback: ✅
   - Must Fix items: 2
   - Agent responded: ❌
   - Ready for re-review: ❌
   
   Feature: [other]
   - ...
   
   Action needed on: docker, [other features]
   ```

5. **Provide Next Steps**
   - If feedback needs addressing:
     ```
     To address feedback:
     1. Read: TODO/FEEDBACK/[feature].md
     2. Fix "Must Fix" items first
     3. Update the feedback file with your fixes
     4. Mark "Ready for re-review" when done
     ```
   
   - If no feedback found:
     ```
     ✅ No feedback to address!
     
     Completed features awaiting review:
     - Check TODO/REVIEW/ for your features
     ```

## Example Output

### With Feedback
```
📋 Review Feedback Status

Found feedback for 1 feature:

docker:
- Must Fix items: 1 (Container startup issue)
- Should Fix items: 2
- Agent response: Not yet
- Status: Needs attention

Next: Read TODO/FEEDBACK/docker.md and address issues
```

### No Feedback
```
✅ No feedback files found

Your completed features may still be awaiting review.
Check TODO/REVIEW/ for review checklists you've created.
```