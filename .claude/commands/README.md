# Available Claude Code Commands

Custom commands for the SpacetimeDB Kanban project. Use these with `/project:command-name`.

## 🚀 Getting Started

### `/project:get-started`
Quick orientation for new agents. Shows project overview, environment check, and available tasks.

### `/project:setup-spacetimedb`
Complete environment setup including SpacetimeDB installation, dependencies, and verification.

## 📊 Project Management

### `/project:sync-status`
Updates CLAUDE.md with latest project information from tracking files. Run weekly or when significant progress is made.

### `/project:claim-task [task-id]`
Claim a specific task, create a git worktree, and get setup instructions.
Example: `/project:claim-task phase1-shadcn-init`

### `/project:check-feedback [feature]`
Check if there's review feedback that needs to be addressed. Without arguments, checks all feedback.

## 🛠️ Development Commands

### `/project:start-dev-env`
Start the Docker development environment with SpacetimeDB, client, and Puppeteer services.

### `/project:test-visual [option]`
Run visual tests using Puppeteer:
- `responsive` - Capture all viewport/theme combinations
- `interaction` - Test basic user flow
- `custom <script>` - Run a custom Puppeteer script

### `/project:write-visual-test [description]`
Generate a custom Puppeteer test script based on your requirements.
Example: `/project:write-visual-test theme switcher functionality`

## 📝 Creating New Commands

To add a new command:
1. Create `.claude/commands/your-command.md`
2. Follow the existing format with Instructions section
3. Update this README with the new command

## 💡 Tips

- Commands support `$ARGUMENTS` for parameters
- Keep commands focused on a single task
- Include error handling instructions
- Provide example output when helpful

## 🔗 Related Documentation

- [Project SOPs](../../TODO/README.md)
- [Development Guide](../../README/development.md)
- [Current Tasks](../../TODO/TRACKING/style-overhaul.md)