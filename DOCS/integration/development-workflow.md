# Development Workflow Guide

This comprehensive guide covers the complete local development setup and workflow for the SpacetimeDB Kanban application, including hot reload, multi-user testing, and debugging strategies.

## Table of Contents

1. [Initial Setup Checklist](#initial-setup-checklist)
2. [Development Environment Configuration](#development-environment-configuration)
3. [Hot Reload Setup](#hot-reload-setup)
4. [Testing Multi-User Scenarios](#testing-multi-user-scenarios)
5. [Debugging Workflows](#debugging-workflows)
6. [Common Development Tasks](#common-development-tasks)
7. [Performance Profiling](#performance-profiling)
8. [Platform-Specific Notes](#platform-specific-notes)
9. [Development Scripts](#development-scripts)

## Initial Setup Checklist

### Prerequisites by Platform

#### Windows (WSL2 Recommended)
```bash
# In WSL2 Ubuntu
curl -sSf https://install.spacetimedb.com | bash
source ~/.bashrc

# Install .NET SDK
wget https://dot.net/v1/dotnet-install.sh
chmod +x ./dotnet-install.sh
./dotnet-install.sh --channel 8.0
```

#### macOS
```bash
# Install SpacetimeDB
curl -sSf https://install.spacetimedb.com | bash

# Install .NET SDK
brew install --cask dotnet-sdk
```

#### Linux
```bash
# Install SpacetimeDB
curl -sSf https://install.spacetimedb.com | bash

# Install .NET SDK (Ubuntu/Debian)
sudo apt-get update && sudo apt-get install -y dotnet-sdk-8.0
```

### Quick Start Setup

```bash
# 1. Clone the repository
git clone <repository-url> kanban-demo
cd kanban-demo

# 2. Install WASI workload for .NET
dotnet workload install wasi-experimental

# 3. Build and publish the server module
spacetime publish --project-path server kanban-plus

# 4. Start the SpacetimeDB instance
spacetime start kanban-plus

# 5. Setup client
cd client
npm install
npm run db:generate  # Generate TypeScript bindings

# 6. Start development server
npm run dev
```

## Development Environment Configuration

### VS Code Setup

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[csharp]": {
    "editor.defaultFormatter": "ms-dotnettools.csharp"
  },
  "[svelte]": {
    "editor.defaultFormatter": "svelte.svelte-vscode"
  },
  "typescript.tsdk": "client/node_modules/typescript/lib",
  "files.exclude": {
    "**/bin": true,
    "**/obj": true,
    "**/node_modules": true
  }
}
```

### Recommended Extensions

- **C# Dev Kit** - C# development tools
- **Svelte for VS Code** - Svelte language support
- **SpacetimeDB** - SpacetimeDB syntax highlighting (if available)
- **Error Lens** - Inline error display
- **GitLens** - Enhanced Git features

### Environment Variables

Create `.env.local` in the client directory:
```bash
# Development settings
VITE_SPACETIME_HOST=ws://localhost:3000
VITE_SPACETIME_MODULE=kanban-plus
VITE_HOT_RELOAD_INTERVAL=1000
```

## Hot Reload Setup

### Client Hot Reload (Built-in with Vite)

The client already supports hot module replacement (HMR) out of the box:

```bash
cd client
npm run dev
# Changes to .svelte, .ts files auto-reload
```

### Server Hot Reload

Create a development script `dev-server.sh`:

```bash
#!/bin/bash
# Save as: scripts/dev-server.sh

WATCH_DIR="server"
MODULE_NAME="kanban-plus"

echo "Starting SpacetimeDB dev server with hot reload..."

# Function to rebuild and restart
rebuild_and_restart() {
    echo "Changes detected, rebuilding..."
    
    # Build the module
    if spacetime publish --project-path $WATCH_DIR $MODULE_NAME; then
        echo " Module rebuilt successfully"
        
        # Generate new bindings
        cd client
        if npm run db:generate; then
            echo " TypeScript bindings regenerated"
        else
            echo " Failed to generate bindings"
        fi
        cd ..
    else
        echo " Build failed, check errors above"
    fi
}

# Initial build and start
rebuild_and_restart
spacetime start $MODULE_NAME &
SPACETIME_PID=$!

# Watch for changes (requires inotify-tools on Linux or fswatch on macOS)
if command -v fswatch >/dev/null 2>&1; then
    # macOS
    fswatch -o $WATCH_DIR -e "bin/" -e "obj/" | while read num ; do
        rebuild_and_restart
    done
elif command -v inotifywait >/dev/null 2>&1; then
    # Linux
    while inotifywait -r -e modify,create,delete $WATCH_DIR --exclude "(bin/|obj/)"; do
        rebuild_and_restart
    done
else
    echo "Please install fswatch (macOS) or inotify-tools (Linux) for file watching"
    echo "macOS: brew install fswatch"
    echo "Linux: sudo apt-get install inotify-tools"
fi

# Cleanup on exit
trap "kill $SPACETIME_PID" EXIT
```

Make it executable:
```bash
chmod +x scripts/dev-server.sh
```

### Automated Development Environment

Create a `Makefile` for common tasks:

```makefile
# Makefile
.PHONY: dev dev-server dev-client build test clean

# Start full development environment
dev:
	@make -j 2 dev-server dev-client

# Start server with hot reload
dev-server:
	./scripts/dev-server.sh

# Start client dev server
dev-client:
	cd client && npm run dev

# Build everything
build:
	spacetime publish --project-path server kanban-plus
	cd client && npm run db:generate && npm run build

# Run tests
test:
	cd server && dotnet test
	cd client && npm run check

# Clean build artifacts
clean:
	cd server && dotnet clean
	cd client && rm -rf dist .svelte-kit

# Reset database
reset-db:
	spacetime delete kanban-plus --confirm
	spacetime publish --project-path server kanban-plus
	spacetime start kanban-plus
```

## Testing Multi-User Scenarios

### Browser-Based Testing

1. **Multiple Profiles Method**:
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Open multiple browser profiles
google-chrome --user-data-dir=/tmp/chrome-user1 http://localhost:5173 &
google-chrome --user-data-dir=/tmp/chrome-user2 http://localhost:5173 &
google-chrome --user-data-dir=/tmp/chrome-user3 http://localhost:5173 &
```

2. **Incognito Windows**:
- Open main window
- Open incognito window (Ctrl+Shift+N / Cmd+Shift+N)
- Open another browser (Firefox, Edge)

### Automated Multi-User Testing

Create `scripts/test-multiuser.js`:

```javascript
#!/usr/bin/env node
// Multi-user simulation script

import { SpacetimeDBClient } from '@clockworklabs/spacetimedb-sdk';

const HOST = 'ws://localhost:3000';
const MODULE = 'kanban-plus';
const USER_COUNT = 5;

async function simulateUser(userId) {
    const client = new SpacetimeDBClient(HOST, MODULE);
    
    await client.onConnect(async () => {
        console.log(`User ${userId} connected`);
        
        // Set username
        await client.reducers.setUserName(`TestUser${userId}`);
        
        // Create a board
        await client.reducers.createBoard(
            `User ${userId}'s Board`,
            `Test board for user ${userId}`
        );
        
        // Subscribe to boards
        await client.subscribe(['SELECT * FROM board']);
        
        // Simulate activity
        setInterval(async () => {
            const boards = Array.from(client.db.board.iter());
            if (boards.length > 0) {
                const randomBoard = boards[Math.floor(Math.random() * boards.length)];
                await client.reducers.addCard(
                    randomBoard.boardId,
                    `Card from User ${userId}`,
                    `Created at ${new Date().toISOString()}`
                );
            }
        }, 5000 + Math.random() * 5000);
    });
}

// Launch multiple users
for (let i = 1; i <= USER_COUNT; i++) {
    simulateUser(i);
}

console.log(`Simulating ${USER_COUNT} users...`);
console.log('Press Ctrl+C to stop');
```

### Load Testing Script

Create `scripts/load-test.sh`:

```bash
#!/bin/bash
# Load testing script

MODULE="kanban-plus"
USERS=10
DURATION=60

echo "Starting load test with $USERS users for $DURATION seconds..."

# Function to simulate a user
simulate_user() {
    local user_id=$1
    node scripts/test-multiuser.js --user-id=$user_id &
}

# Start users
for i in $(seq 1 $USERS); do
    simulate_user $i
    sleep 0.5  # Stagger connections
done

# Run for specified duration
sleep $DURATION

# Kill all node processes
pkill -f "test-multiuser.js"

echo "Load test completed"
```

## Debugging Workflows

### Server-Side Debugging

1. **Enable Debug Logging**:
```csharp
// In Module.cs
[SpacetimeDB.Module]
public static partial class Module
{
    private static void Log(string message)
    {
        Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss.fff}] {message}");
    }
    
    [Reducer]
    public static void AddCard(ReducerContext ctx, ulong boardId, string title, string description)
    {
        Log($"AddCard called: boardId={boardId}, title={title}");
        // ... rest of implementation
    }
}
```

2. **View Real-time Logs**:
```bash
# Follow logs in real-time
spacetime logs kanban-plus -f

# Filter logs
spacetime logs kanban-plus -f | grep "AddCard"

# Save logs to file
spacetime logs kanban-plus > debug.log
```

3. **SQL Console Debugging**:
```bash
# Open SQL console
spacetime sql kanban-plus

# Example queries
SELECT * FROM user;
SELECT * FROM board WHERE created_by = 0x<identity>;
SELECT COUNT(*) FROM card WHERE board_id = 1;
```

### Client-Side Debugging

1. **Enhanced Console Logging**:
```typescript
// In stores/debug-logger.ts
export class DebugLogger {
    private context: string;
    private enabled: boolean;
    
    constructor(context: string) {
        this.context = context;
        this.enabled = import.meta.env.DEV;
    }
    
    log(message: string, data?: any) {
        if (this.enabled) {
            console.log(`[${this.context}] ${message}`, data || '');
        }
    }
    
    error(message: string, error?: any) {
        console.error(`[${this.context}] ${message}`, error || '');
    }
}

// Usage in stores
const logger = new DebugLogger('BoardStore');
logger.log('Board created', { boardId, title });
```

2. **WebSocket Debugging**:
```typescript
// In spacetime.ts - Add WebSocket interceptor
export function connectDb(onConnect: ConnectCallback) {
    const client = new SpacetimeDBClient(HOST, MODULE);
    
    // Intercept WebSocket messages
    const originalSend = client.ws.send;
    client.ws.send = function(data) {
        console.log('[WS Send]', data);
        return originalSend.call(this, data);
    };
    
    client.ws.addEventListener('message', (event) => {
        console.log('[WS Receive]', event.data);
    });
    
    // ... rest of connection logic
}
```

3. **Svelte DevTools Setup**:
```json
// In client/vite.config.ts
export default defineConfig({
    plugins: [sveltekit()],
    build: {
        sourcemap: true
    },
    define: {
        '__ENABLE_DEVTOOLS__': JSON.stringify(true)
    }
});
```

### Performance Debugging

1. **Server Performance Monitoring**:
```csharp
// Performance timing utility
public static class PerfTimer
{
    public static void Time(string operation, Action action)
    {
        var sw = Stopwatch.StartNew();
        action();
        sw.Stop();
        Console.WriteLine($"[PERF] {operation}: {sw.ElapsedMilliseconds}ms");
    }
}

// Usage
[Reducer]
public static void ComplexOperation(ReducerContext ctx)
{
    PerfTimer.Time("Query boards", () => {
        var boards = ctx.Db.board.Iter().ToList();
    });
}
```

2. **Client Performance Profiling**:
```typescript
// Performance monitoring store
export function createPerfMonitor() {
    const metrics = $state<Map<string, number[]>>(new Map());
    
    return {
        measure(name: string, fn: () => void) {
            const start = performance.now();
            fn();
            const duration = performance.now() - start;
            
            if (!metrics.has(name)) {
                metrics.set(name, []);
            }
            metrics.get(name)!.push(duration);
            
            // Log slow operations
            if (duration > 100) {
                console.warn(`[PERF] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
            }
        },
        
        getStats(name: string) {
            const times = metrics.get(name) || [];
            if (times.length === 0) return null;
            
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            const max = Math.max(...times);
            const min = Math.min(...times);
            
            return { avg, max, min, count: times.length };
        }
    };
}
```

## Common Development Tasks

### Adding a New Feature

1. **Server-Side Changes**:
```bash
# 1. Create new domain file
touch server/domains/Comments.cs

# 2. Edit and add table/reducers
# 3. Rebuild
spacetime publish --project-path server kanban-plus

# 4. Generate bindings
cd client && npm run db:generate
```

2. **Client-Side Integration**:
```bash
# 1. Create new store
touch client/src/lib/stores/comment-store.svelte.ts

# 2. Create component
touch client/src/lib/components/CommentList.svelte

# 3. Update routes
# 4. Test with hot reload
npm run dev
```

### Database Schema Changes

1. **Safe Migration Pattern**:
```csharp
// 1. Add new column with default
[Table(Name = "card", Public = true)]
public partial struct Card
{
    // ... existing fields
    public string Priority = "medium"; // New field with default
}

// 2. Create migration reducer
[Reducer("migrate_cards_priority")]
public static void MigrateCardsPriority(ReducerContext ctx)
{
    foreach (var card in ctx.Db.card.Iter())
    {
        if (string.IsNullOrEmpty(card.Priority))
        {
            card.Priority = "medium";
            ctx.Db.card.CardId.Update(card);
        }
    }
}
```

2. **Testing Migration**:
```bash
# Backup current state
spacetime sql kanban-plus "SELECT * FROM card" > cards-backup.sql

# Deploy new version
spacetime publish --project-path server kanban-plus

# Run migration
spacetime call kanban-plus migrate_cards_priority

# Verify
spacetime sql kanban-plus "SELECT card_id, priority FROM card LIMIT 10"
```

### Debugging Connection Issues

1. **Client Connection Diagnostics**:
```typescript
// Add to ConnectionInitializer.svelte
const connectionDiagnostics = {
    attempts: 0,
    lastError: null as Error | null,
    connectionStart: Date.now()
};

function connectWithDiagnostics() {
    connectionDiagnostics.attempts++;
    
    connectDb((conn, id, tok) => {
        const duration = Date.now() - connectionDiagnostics.connectionStart;
        console.log(`Connected after ${connectionDiagnostics.attempts} attempts in ${duration}ms`);
        
        // Set up connection monitoring
        setInterval(() => {
            if (!conn.connected) {
                console.error('Connection lost!', {
                    lastPing: conn.lastPing,
                    readyState: conn.ws?.readyState
                });
            }
        }, 5000);
    }).catch(error => {
        connectionDiagnostics.lastError = error;
        console.error('Connection failed:', error);
    });
}
```

2. **Server Health Check**:
```bash
# Create health check script
#!/bin/bash
# scripts/health-check.sh

MODULE="kanban-plus"

echo "Checking SpacetimeDB health..."

# Check if running
if spacetime info $MODULE > /dev/null 2>&1; then
    echo " Module is running"
    
    # Check table counts
    echo "Table statistics:"
    spacetime sql $MODULE "SELECT 'users' as table_name, COUNT(*) as count FROM user
    UNION ALL SELECT 'boards', COUNT(*) FROM board
    UNION ALL SELECT 'cards', COUNT(*) FROM card"
    
    # Check recent activity
    echo -e "\nRecent cards (last 5):"
    spacetime sql $MODULE "SELECT card_id, title, created_at FROM card ORDER BY created_at DESC LIMIT 5"
else
    echo " Module is not running"
    echo "Start with: spacetime start $MODULE"
fi
```

## Performance Profiling

### Memory Usage Monitoring

1. **Server Memory Profiling**:
```csharp
[Reducer("debug_memory_stats")]
public static void DebugMemoryStats(ReducerContext ctx)
{
    var userCount = ctx.Db.user.Count();
    var boardCount = ctx.Db.board.Count();
    var cardCount = ctx.Db.card.Count();
    
    Console.WriteLine($"Memory Stats: Users={userCount}, Boards={boardCount}, Cards={cardCount}");
    Console.WriteLine($"Estimated memory: {(userCount * 100 + boardCount * 200 + cardCount * 300) / 1024}KB");
}
```

2. **Client Bundle Analysis**:
```bash
# Build with analysis
cd client
npm run build -- --mode=development

# Install bundle analyzer
npm i -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    plugins: [
        sveltekit(),
        visualizer({
            emitFile: true,
            filename: 'stats.html'
        })
    ]
});

# Build and open stats
npm run build && open stats.html
```

### Network Traffic Analysis

```typescript
// Network monitor utility
export class NetworkMonitor {
    private requestCount = 0;
    private bytesReceived = 0;
    private bytesSent = 0;
    
    instrumentWebSocket(ws: WebSocket) {
        const originalSend = ws.send.bind(ws);
        
        ws.send = (data) => {
            this.requestCount++;
            this.bytesSent += new Blob([data]).size;
            return originalSend(data);
        };
        
        ws.addEventListener('message', (event) => {
            this.bytesReceived += new Blob([event.data]).size;
        });
    }
    
    getStats() {
        return {
            requests: this.requestCount,
            sent: `${(this.bytesSent / 1024).toFixed(2)}KB`,
            received: `${(this.bytesReceived / 1024).toFixed(2)}KB`
        };
    }
}
```

## Platform-Specific Notes

### Windows (Native)

```powershell
# PowerShell development commands
# Watch and rebuild server
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = ".\server"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

Register-ObjectEvent $watcher "Changed" -Action {
    Write-Host "Rebuilding server..."
    spacetime publish --project-path server kanban-plus
}
```

### macOS

```bash
# Install development dependencies
brew install fswatch
brew install --cask dotnet-sdk

# macOS-specific file watching
fswatch -o server | xargs -n1 -I{} spacetime publish --project-path server kanban-plus
```

### Linux

```bash
# Install development dependencies
sudo apt-get install inotify-tools

# Linux-specific optimization
# Increase inotify watchers for large projects
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Development Scripts

### Complete Development Setup Script

Create `scripts/setup-dev.sh`:

```bash
#!/bin/bash
# Complete development environment setup

set -e  # Exit on error

echo "Setting up SpacetimeDB Kanban development environment..."

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "Error: $1 is not installed"
        exit 1
    fi
}

check_command spacetime
check_command dotnet
check_command node
check_command npm

# Setup function
setup_project() {
    echo "1. Installing .NET WASI workload..."
    dotnet workload install wasi-experimental || true

    echo "2. Building server module..."
    spacetime publish --project-path server kanban-plus

    echo "3. Installing client dependencies..."
    cd client
    npm install

    echo "4. Generating TypeScript bindings..."
    npm run db:generate

    echo "5. Creating development scripts..."
    cd ..
    mkdir -p scripts
    
    # Create watch script
    cat > scripts/watch-server.sh << 'EOF'
#!/bin/bash
while true; do
    inotifywait -r -e modify,create,delete server --exclude "(bin/|obj/)" || true
    echo "Changes detected, rebuilding..."
    spacetime publish --project-path server kanban-plus
    cd client && npm run db:generate && cd ..
done
EOF
    chmod +x scripts/watch-server.sh

    echo " Setup complete!"
}

# Run setup
setup_project

echo ""
echo "To start development:"
echo "  1. In terminal 1: spacetime start kanban-plus"
echo "  2. In terminal 2: ./scripts/watch-server.sh"
echo "  3. In terminal 3: cd client && npm run dev"
```

### Quick Reset Script

Create `scripts/reset-dev.sh`:

```bash
#!/bin/bash
# Reset development environment

echo "Resetting development environment..."

# Stop any running processes
pkill -f "spacetime start" || true
pkill -f "npm run dev" || true

# Clean build artifacts
cd server && dotnet clean && cd ..
cd client && rm -rf dist .svelte-kit node_modules && cd ..

# Remove database
spacetime delete kanban-plus --confirm || true

# Reinstall
./scripts/setup-dev.sh

echo " Environment reset complete!"
```

## Troubleshooting Common Issues

### Issue: Changes not reflecting after rebuild

```bash
# Clear all caches
cd client
rm -rf .svelte-kit
npm run db:generate --force

# Restart SpacetimeDB
spacetime delete kanban-plus --confirm
spacetime publish --project-path ../server kanban-plus
spacetime start kanban-plus
```

### Issue: TypeScript errors in generated code

```bash
# Ensure latest SDK version
cd client
npm update @clockworklabs/spacetimedb-sdk

# Regenerate with clean state
rm -rf src/lib/generated
npm run db:generate
```

### Issue: WebSocket connection drops

```typescript
// Add reconnection logic
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function connectWithRetry() {
    connectDb(onConnect).catch(error => {
        if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`Reconnecting in ${delay}ms...`);
            setTimeout(connectWithRetry, delay);
        }
    });
}
```

## Best Practices

1. **Always test with multiple users** - Real-time features may work in single-user but fail with concurrency
2. **Use typed stores** - Leverage TypeScript for better IDE support and error catching
3. **Monitor WebSocket traffic** - Keep an eye on message frequency to avoid overwhelming the connection
4. **Profile regularly** - Run performance checks as you add features
5. **Document reducer side effects** - Make it clear what each reducer modifies
6. **Use transactions wisely** - Group related operations in single reducers when possible

## Next Steps

- Review [Real-Time Sync Guide](./real-time-sync.md) for advanced synchronization patterns
- Check [Deployment Guide](./deployment.md) for production setup
- See [Type Safety Guide](./type-safety.md) for TypeScript best practices

Happy coding! =€