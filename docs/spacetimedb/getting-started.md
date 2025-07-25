# Getting Started with SpacetimeDB

This guide walks you through setting up SpacetimeDB for local development, based on our experience building the Kanban application.

## Prerequisites

- **Operating System**: Linux, macOS, or Windows (WSL2 recommended)
- **.NET SDK**: 8.0 or later with WASI workload
- **Node.js**: 18+ for the TypeScript client
- **Git**: For version control

## Installation

### 1. Install SpacetimeDB CLI

Based on `CLAUDE.md:23`:

```bash
# Install SpacetimeDB
curl -s https://install.spacetimedb.com | bash

# Verify installation
spacetime --version
```

### 2. Install .NET WASI Workload

Required for compiling C# modules to WebAssembly:

```bash
# Install WASI experimental workload
dotnet workload install wasi-experimental

# Verify installation
dotnet workload list
```

**Common Issue**: If you get SDK version errors, ensure you have .NET 8.0:
```bash
dotnet --list-sdks
```

## Creating Your First Module

### 1. Initialize Project Structure

```bash
# Create project directory
mkdir kanban-demo && cd kanban-demo

# Initialize SpacetimeDB module
spacetime init --lang csharp server
```

This creates:
```
server/
   StdbModule.csproj    # Project configuration
   Module.cs            # Main module file
   global.json          # .NET version pinning
```

### 2. Define Your Schema

Replace the default `Module.cs` with your domain model. From our implementation (`server/Module.cs`):

```csharp
using SpacetimeDB;

namespace StdbModule;

[SpacetimeDB.Table]
public partial class User
{
    [SpacetimeDB.Unique]
    public Identity Id { get; set; }
    public string? Name { get; set; }
    public bool Online { get; set; }
}

[SpacetimeDB.Table]
public partial class Board
{
    [SpacetimeDB.PrimaryKey]
    public ulong BoardId { get; set; }
    
    [SpacetimeDB.Unique]
    public string Slug { get; set; } = "";
    
    public string Title { get; set; } = "";
    public Identity Owner { get; set; }
}
```

### 3. Add Reducers

Reducers are like stored procedures. Example from `server/domains/Boards.cs:10`:

```csharp
[SpacetimeDB.Reducer]
public static void CreateBoard(ReducerContext ctx, string slug, string title)
{
    if (Board.FilterBySlug(slug).Any())
    {
        throw new Exception($"Board with slug '{slug}' already exists");
    }
    
    new Board
    {
        BoardId = Board.Count() + 1,
        Slug = slug,
        Title = title,
        Owner = ctx.Sender
    }.Insert();
}
```

### 4. Build and Publish

```bash
# Build the module
spacetime publish --project-path server kanban-plus

# If successful, you'll see:
# Published module kanban-plus
```

**Troubleshooting Build Errors**:
- Check `global.json` matches your .NET version
- Ensure WASI workload is installed
- Look for nullable reference warnings

## Starting the Database

### 1. Run Local SpacetimeDB Instance

```bash
# Start the database
spacetime start kanban-plus

# You'll see:
# Starting SpacetimeDB on ws://localhost:3000/kanban-plus
```

### 2. Verify It's Running

```bash
# In another terminal
spacetime logs kanban-plus --follow
```

## Client Setup

### 1. Create TypeScript Client

```bash
# Create Svelte 5 app
npm create vite@latest client -- --template svelte@next
cd client
npm install

# Add SpacetimeDB SDK
npm install @clockworklabs/spacetimedb-sdk
```

### 2. Generate TypeScript Bindings

This creates type-safe bindings from your C# schema:

```bash
spacetime generate --lang typescript \
  --project-path ../server \
  --out-dir src/lib/generated
```

This generates files like:
- `user_table.ts` - User type and methods
- `board_table.ts` - Board type and methods  
- `create_board_reducer.ts` - Reducer functions

### 3. Connect to SpacetimeDB

Create `src/lib/spacetime.ts`:

```typescript
import { SpacetimeDBClient } from '@clockworklabs/spacetimedb-sdk';

const HOST = 'ws://localhost:3000';
const NAMESPACE = 'kanban-plus';

export const client = new SpacetimeDBClient(HOST, NAMESPACE);

// Connect with stored identity
export async function connect() {
    const identity = localStorage.getItem('stdb-identity');
    
    if (identity) {
        await client.connect(identity);
    } else {
        const newIdentity = await client.connect();
        localStorage.setItem('stdb-identity', newIdentity);
    }
}
```

### 4. Use in Components

```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import { connect } from '$lib/spacetime';
    import { Board } from '$lib/generated';
    
    let boards = $state<Board[]>([]);
    
    onMount(async () => {
        await connect();
        
        // Subscribe to boards
        Board.onInsert((board) => {
            boards = [...boards, board];
        });
    });
</script>
```

## Development Workflow

### 1. Hot Reload Setup

For the server (using our experience):
```bash
# Install watcher
npm install -g nodemon

# Watch and rebuild
nodemon --watch server --ext cs \
  --exec "spacetime publish --project-path server kanban-plus"
```

For the client:
```bash
cd client
npm run dev
```

### 2. Testing Multi-User

Open multiple browser tabs/windows:
1. Each gets a unique identity
2. Changes sync in real-time
3. Use incognito for different users

### 3. Debugging

Check server logs:
```bash
spacetime logs kanban-plus --follow
```

Enable client debugging (`client/src/lib/spacetime.ts:16`):
```typescript
client.on('connect', () => console.log('Connected!'));
client.on('disconnect', () => console.log('Disconnected!'));
```

## Common Gotchas

### 1. Identity Not Persisting
- Check localStorage is not blocked
- Ensure consistent connection approach

### 2. Types Out of Sync
- Regenerate after schema changes
- Restart dev server after generation

### 3. WebSocket Connection Failed
- Verify SpacetimeDB is running
- Check firewall/proxy settings
- Ensure correct host/namespace

## Next Steps

1. Explore [Architecture](architecture.md) to understand how it works
2. Learn about [Reducers and Tables](reducers-and-tables.md)
3. Master the [Client SDK](client-sdk.md)
4. Check [Debugging Guide](debugging.md) when issues arise

## Quick Reference

```bash
# Server commands
spacetime publish --project-path server kanban-plus
spacetime start kanban-plus
spacetime logs kanban-plus --follow

# Client commands
spacetime generate --lang typescript \
  --project-path ../server \
  --out-dir src/lib/generated

# Development
cd client && npm run dev
```

---

*Last Updated: 2025-01-03*