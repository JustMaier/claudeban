# Setup SpacetimeDB Development Environment

Installs SpacetimeDB and sets up the Kanban project for development.

## Instructions

1. **Detect Operating System**
   - Check if running on Linux, macOS, or Windows
   - For Windows, check if in WSL2
   - Verify prerequisites (Git, Node.js)

2. **Check Node.js Version**
   - Run `node --version`
   - If < 20, provide instructions to upgrade
   - This is required for shadcn-svelte

3. **Install SpacetimeDB**
   - For Linux/Mac: `curl -sSf https://install.spacetimedb.com | bash`
   - For Windows: Download installer or use winget
   - Verify with `spacetime version`
   - Add to PATH if needed

4. **Install .NET WASI Support**
   - Check if .NET SDK is installed: `dotnet --version`
   - Install WASI workload: `dotnet workload install wasi-experimental`
   - This is needed to compile the server module

5. **Setup Project Dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

6. **Build and Publish Server Module**
   ```bash
   # Build the server module
   spacetime publish --project-path server kanban-plus
   ```

7. **Generate TypeScript Bindings**
   ```bash
   cd client
   spacetime generate --lang typescript --project-path ../server --out-dir src/lib/generated
   cd ..
   ```

8. **Start Services**
   - Terminal 1: `spacetime start kanban-plus`
   - Terminal 2: `cd client && npm run dev`
   - Note: These need to run in separate terminals

9. **Verify Setup**
   - Open http://localhost:5173
   - Create a test board
   - Add a test card
   - Open another tab to verify real-time sync
   - If working, setup is complete!

10. **Provide Next Steps**
    - Point to README.md for documentation
    - Show current development tasks in TODO/TRACKING/
    - Explain how to contribute

## Troubleshooting

If any step fails:
- Check error messages carefully
- Refer to README/setup-[os].md for OS-specific help
- Common issues:
  - Port 3000 already in use
  - Node.js version too old
  - PATH not updated after SpacetimeDB install