# Claim a Task

Helps an agent claim and start work on a specific task.

## Usage
/project:claim-task $ARGUMENTS

Where $ARGUMENTS is the task ID (e.g., "phase1-server-models")

## Instructions

1. **Find the Task**
   - Search for task ID in `TODO/TRACKING/style-overhaul.md`
   - Verify task status is ⬜ (not started)
   - Check dependencies are met
   - Note which phase the task belongs to

2. **Create Git Worktree**
   Based on the task type, create appropriate worktree:
   ```bash
   # Determine branch name from task
   # phase1-server-models → feature/server-models
   # phase2-theme-system → feature/theme-system
   
   git worktree add ../initial-worktrees/agent-[task-short-name] -b [branch-name]
   ```

3. **Update Tracking File**
   In `TODO/TRACKING/style-overhaul.md`:
   - Change status from ⬜ to 🟦
   - Add agent name and timestamp
   - Example:
   ```markdown
   **Status**: 🟦 In Progress
   **Assigned**: [Agent Name]
   **Started**: 2025-01-04 10:30 AM
   ```

4. **Provide Setup Instructions**
   Based on the task, provide specific setup:
   
   **For server tasks**:
   ```bash
   cd ../initial-worktrees/agent-[name]
   # Edit server files
   # Test with: spacetime publish --project-path server kanban-plus
   ```
   
   **For client tasks**:
   ```bash
   cd ../initial-worktrees/agent-[name]/client
   npm install
   npm run dev
   ```

5. **Show Task Checklist**
   Extract and display the task's checklist from tracking file
   Highlight any special notes or dependencies

6. **Set Up Reminders**
   - Remind to update tracking file progress
   - Remind to commit frequently
   - Note PR process when complete

## Task ID Mapping

Common task IDs and their meanings:
- `phase1-shadcn-init` → Initialize shadcn-svelte
- `phase1-server-models` → Update server models
- `phase1-reducers` → Create new reducers
- `phase2-theme-system` → Theme system implementation
- `phase2-component-library` → Component setup
- `phase3-user-components` → UserDisplay, UserAvatar
- `phase3-drag-drop` → Drag and drop implementation

## Example Flow

Input: `/project:claim-task phase2-theme-system`

Output:
```
📋 Claiming task: Theme System Implementation

✅ Created worktree at: ../initial-worktrees/agent-theme
✅ Switched to branch: feature/theme-system
✅ Updated tracking file to show task claimed

📍 Your workspace: ../initial-worktrees/agent-theme
📝 Task checklist:
  □ Create theme-store.svelte.ts
  □ Implement 12 primary colors
  □ Create HSL manipulation functions
  □ Build ThemeProvider component
  □ Add persistence to localStorage

⚠️ Dependencies: Requires Phase 1 completion (shadcn-svelte init)

💡 Next steps:
1. cd ../initial-worktrees/agent-theme
2. Start implementing theme-store.svelte.ts
3. Update tracking file as you complete subtasks
4. Commit with: git commit -m "feat: implement theme store"

Good luck! 🚀
```

## Error Handling

- If task already claimed (🟦 or ✅), show current assignee
- If dependencies not met, list what needs completion first
- If worktree creation fails, provide troubleshooting steps
- Always show current task status, even on error