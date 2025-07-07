# Sync Project Status

Updates CLAUDE.md with the latest project information from tracking files.

## Instructions

1. **Read Current Tracking Files**
   - Read all `.md` files in `docs/todo/TRACKING/`
   - Parse status indicators (⬜, 🟦, ✅, ❌, ⏸️)
   - Count completed vs pending tasks per phase
   - Identify current assignees

2. **Check Recent Git Activity**
   ```bash
   # Get commits since last update (from CLAUDE.md timestamp)
   git log --since="2025-01-03" --oneline
   ```
   - Summarize major changes
   - Note any merged PRs

3. **Extract Task Information**
   Look for patterns in tracking files:
   - `**Status**: ⬜` - Not started
   - `**Status**: 🟦` - In progress
   - `**Assigned**: [Name]`
   - Task titles and descriptions

4. **Update CLAUDE.md Sections**
   
   **Update timestamp**:
   ```
   Last Updated: [current date] by /project:sync-status command
   ```
   
   **Update Project Status**:
   - Calculate phase completion percentages
   - List recently completed items (✅ in last 7 days)
   - Show current in-progress items with assignees
   - List available tasks (⬜ status)
   
   **Update Current Opportunities**:
   - Extract unclaimed Phase 1 tasks
   - Note which phases are blocked by dependencies
   - Highlight parallel work opportunities

5. **Preserve Manual Additions**
   - Keep any sections not auto-generated
   - Preserve custom notes or warnings
   - Maintain formatting consistency

6. **Create Update Log Entry**
   Append to `docs/todo/TRACKING/update-log.md`:
   ```markdown
   ## [Date] - sync-status run
   - Updated task counts
   - Changes detected: [list]
   - Next suggested update: [date + 7 days]
   ```

## Example Output Format

```markdown
## 📊 Project Status

- **Active Phase**: Phase 2 (3/5 tasks completed)
- **Recently Completed**: 
  - ✅ shadcn-svelte initialization (Agent A, 2025-01-04)
  - ✅ Server model updates (Agent B, 2025-01-04)
- **In Progress**: 
  - 🟦 Theme system implementation (Agent C)
  - 🟦 Component library setup (Agent D)
- **Available Tasks**: 
  - Card position reducer
  - User theme preference reducer
```

## Error Handling

- If tracking files are missing, note in status
- If git commands fail, skip git summary
- Always complete update even with partial data
- Log any errors to update-log.md