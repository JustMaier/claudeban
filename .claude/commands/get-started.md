# Get Started

Quick orientation for new agents joining the project.

## Instructions

1. **Show Project Overview**
   - Display project description
   - Current phase and progress
   - Key technologies (SpacetimeDB, Svelte 5, shadcn)

2. **Check Environment**
   ```bash
   # Verify key tools
   spacetime version || echo "❌ SpacetimeDB not installed"
   node --version || echo "❌ Node.js not installed"
   dotnet --version || echo "❌ .NET SDK not installed"
   ```

3. **List Available Work**
   - Read TODO/TRACKING/style-overhaul.md
   - Show all ⬜ (unclaimed) tasks
   - Highlight Phase 1 tasks if not complete
   - Note any blocked tasks

4. **Explain Workflow**
   Show the basic workflow:
   ```
   1. Run: /project:claim-task [task-id]
   2. Work in your git worktree
   3. Update tracking as you progress
   4. Create PR when complete
   ```

5. **Provide Quick Links**
   - README.md - Human-friendly docs
   - TODO/README.md - Full SOPs
   - TODO/TRACKING/ - Current work
   - README/development.md - Dev guide

6. **Show Next Actions**
   Based on project state:
   - If new to project: "Start with /project:setup-spacetimedb"
   - If env ready: "Check available tasks above"
   - If tasks available: "Run /project:claim-task [id]"

## Example Output

```
👋 Welcome to SpacetimeDB Kanban!

📊 Project Overview:
A real-time collaborative kanban board showcasing SpacetimeDB's 
capabilities. Currently in Phase 1 of a major UI overhaul using 
shadcn-svelte.

✅ Environment Check:
- SpacetimeDB: v0.8.0 ✓
- Node.js: v20.11.0 ✓
- .NET SDK: 8.0.100 ✓

📋 Available Tasks:
Phase 1 (Start Here!):
- phase1-shadcn-init: Initialize shadcn-svelte
- phase1-server-models: Add position & theme fields
- phase1-reducers: Create sorting & theme reducers

🚀 Ready to contribute? 
Run: /project:claim-task phase1-shadcn-init

📚 Resources:
- Full docs: README.md
- Dev guide: README/development.md
- SOPs: TODO/README.md
```