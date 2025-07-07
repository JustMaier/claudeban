# Linux/Mac Setup Guide

This guide walks you through setting up the SpacetimeDB Kanban demo on Linux or macOS.

## Prerequisites

- **Node.js 20+** (required for shadcn-svelte)
- **Git**
- **Rust** (will be installed by SpacetimeDB if needed)

## Step 1: Install SpacetimeDB

```bash
# Official installer (recommended)
curl -sSf https://install.spacetimedb.com | bash

# Add to PATH (if not done automatically)
echo 'export PATH="$HOME/.spacetimedb/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
spacetime version
```

## Step 2: Install .NET WASI Support

```bash
# Install .NET SDK if not present
# Ubuntu/Debian:
sudo apt-get update && sudo apt-get install -y dotnet-sdk-8.0

# macOS with Homebrew:
brew install --cask dotnet-sdk

# Install WASI workload
dotnet workload install wasi-experimental
```

## Step 3: Clone and Setup Project

```bash
# Clone the repository
git clone [your-repo-url] spacetimedb-kanban
cd spacetimedb-kanban/initial

# Install client dependencies
cd client
npm install

# Return to project root
cd ..
```

## Step 4: Build and Start Services

```bash
# Terminal 1: Build and publish the server module
spacetime publish --project-path server kanban-plus

# Terminal 2: Start SpacetimeDB
spacetime start kanban-plus

# Terminal 3: Start the client dev server
cd client
npm run dev
```

## Step 5: Verify Setup

1. Open http://localhost:5173 in your browser
2. Create a new board
3. Add some cards
4. Open another browser tab to see real-time sync

## Troubleshooting

### "spacetime: command not found"
- Ensure PATH is updated: `source ~/.bashrc` or `source ~/.zshrc`
- Check installation: `ls ~/.spacetimedb/bin/`

### "dotnet workload install fails"
- Update .NET SDK: `dotnet --list-sdks`
- May need SDK 8.0+: `sudo apt-get install dotnet-sdk-8.0`

### "npm install fails with Node version error"
```bash
# Install Node 20+ using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### Port conflicts
- SpacetimeDB uses port 3000
- Vite dev server uses port 5173
- Check with: `lsof -i :3000` or `lsof -i :5173`

## Next Steps

- Read the [Architecture Overview](architecture.md)
- Check out the [Development Guide](development.md)
- Start contributing! See [available tasks](../TODO/TRACKING/style-overhaul.md)