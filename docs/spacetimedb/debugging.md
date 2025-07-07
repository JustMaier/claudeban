# SpacetimeDB Debugging Guide

This guide covers debugging techniques for SpacetimeDB applications, based on real issues encountered during development. It includes both server-side (C#) and client-side (TypeScript/Svelte) debugging approaches.

## Table of Contents

1. [Common Issues Quick Reference](#common-issues-quick-reference)
2. [Connection and Authentication Issues](#connection-and-authentication-issues)
3. [Subscription and Data Sync Problems](#subscription-and-data-sync-problems)
4. [Identity and Authorization Debugging](#identity-and-authorization-debugging)
5. [Performance Issues](#performance-issues)
6. [Data Consistency Problems](#data-consistency-problems)
7. [Build and Compilation Errors](#build-and-compilation-errors)
8. [Client-Side Debugging](#client-side-debugging)
9. [Server-Side Debugging](#server-side-debugging)
10. [Debugging Tools and Utilities](#debugging-tools-and-utilities)
11. [Debugging Checklist](#debugging-checklist)

## Common Issues Quick Reference

| Issue | Likely Cause | Quick Fix |
|-------|--------------|-----------|
| No data showing in UI | Subscription not applied | Check subscription logs, ensure `onSubscribeApplied` |
| `state_unsafe_mutation` error | Modifying $state in $derived | Move mutation out of reactive context |
| `CallerAddress` not found | API version mismatch | Update to `ctx.Sender` |
| Connection drops | Timeout or network issue | Implement reconnection logic |
| Identity mismatch | Multiple connections | Use consistent identity storage |

## Connection and Authentication Issues

### Problem: WebSocket Connection Failures

**Symptoms:**
- Connection attempts fail silently
- "Connection refused" errors
- Immediate disconnection after connecting

**Debugging Steps:**

1. **Verify the SpacetimeDB instance is running:**
   ```bash
   spacetime logs kanban-plus
   # Should show active connections and operations
   ```

2. **Check connection URL format:**
   ```typescript
   // Correct format
   const DB_URI = "ws://localhost:3000/kanban-plus";
   
   // Common mistakes
   // L "http://..." (should be ws://)
   // L "ws://localhost:3000" (missing module name)
   // L "ws://localhost:3000/kanban-plus/" (trailing slash)
   ```

3. **Enable verbose logging:**
   ```typescript
   // In spacetime.ts
   export async function connect() {
     console.info('Connecting to SpacetimeDB WS...');
     
     const conn = new SpacetimeDBClient(DB_URI, DB_NAME, {
       onConnect: () => console.log('WebSocket connected'),
       onDisconnect: (error) => console.error('WebSocket disconnected:', error),
       onError: (error) => console.error('WebSocket error:', error)
     });
   }
   ```

### Problem: Identity Issues

**Symptoms:**
- User appears as different identities
- Lost authentication between sessions
- `ctx.Sender` returning unexpected values

**Solution Pattern:**
```typescript
// Store identity consistently
class ConnectionStore {
  private identity = $state<Identity | null>(null);
  
  async connect() {
    // Check for stored identity
    const storedIdentity = localStorage.getItem('spacetime-identity');
    
    const token = storedIdentity ? { identity: storedIdentity } : undefined;
    const conn = new SpacetimeDBClient(DB_URI, DB_NAME, token);
    
    // Store identity on first connection
    conn.on('connect', (identity) => {
      this.identity = identity;
      localStorage.setItem('spacetime-identity', identity.toHex());
    });
  }
}
```

## Subscription and Data Sync Problems

### Problem: No Data After Subscription

**Real Example from Logs:**
```
[BoardStore] Board subscription applied
[BoardStore] Board inserted: {boardId: 1n, slug: 'test', ...}
// But UI shows no boards
```

**Root Causes:**

1. **Reactive state mutation in derived context:**
   ```typescript
   // L Wrong - causes state_unsafe_mutation
   const boardActivity = $derived(() => {
     const activity = activityStore.getBoardActivity(board.boardId);
     // This mutates state inside $derived!
     activityCache.set(board.boardId, activity);
     return activity;
   });
   
   //  Correct - use effect for mutations
   $effect(() => {
     const activity = activityStore.getBoardActivity(board.boardId);
     activityCache.set(board.boardId, activity);
   });
   ```

2. **Missing subscription lifecycle handling:**
   ```typescript
   // Always wait for subscription confirmation
   conn.db.board.onSubscribeApplied(() => {
     console.log('[BoardStore] Ready to receive data');
     this.subscriptionReady = true;
   });
   ```

3. **Row-level security filtering:**
   ```csharp
   // Check if user has access
   [ClientVisibilityFilter]
   public static readonly Filter BOARD_VIS = 
     new Filter.Sql(@"
       SELECT board.* FROM board
       INNER JOIN collaborator ON board.BoardId = collaborator.BoardId
       WHERE collaborator.Identity = :sender
     ");
   ```

### Debugging Subscription Issues

1. **Add comprehensive logging:**
   ```typescript
   class BoardStore {
     subscribe() {
       const tables = ['board', 'card', 'collaborator'];
       tables.forEach(table => {
         console.log(`[BoardStore] Subscribing to ${table}`);
       });
       
       conn.subscribe(
         ['SELECT * FROM board', 'SELECT * FROM card'],
         {
           onApplied: () => {
             console.log('[BoardStore] All subscriptions applied');
             this.loadInitialData();
           },
           onError: (error) => {
             console.error('[BoardStore] Subscription error:', error);
           }
         }
       );
     }
   }
   ```

2. **Verify data in SQL console:**
   ```bash
   spacetime sql kanban-plus
   > SELECT COUNT(*) FROM board;
   > SELECT * FROM collaborator WHERE Identity = 0x...;
   ```

## Identity and Authorization Debugging

### Problem: API Version Mismatches

**From actual logs:**
```
error CS1061: 'ReducerContext' does not contain a definition for 'CallerAddress'
```

**Solution:**
```csharp
// Old API (pre-0.11)
var userId = ctx.CallerAddress;

// New API (0.11+)
var userId = ctx.Sender;
var connection = ctx.ConnectionId;
var timestamp = ctx.Timestamp;
```

### Problem: Row-Level Security Not Working

**Debugging Steps:**

1. **Test without filters first:**
   ```csharp
   // Temporarily disable to isolate issue
   // [ClientVisibilityFilter]
   // public static readonly Filter BOARD_VIS = ...
   ```

2. **Log filter execution:**
   ```csharp
   [Reducer]
   public static void DebugAccess(ReducerContext ctx, ulong boardId) {
     var hasAccess = ctx.Db.collaborator.BoardIdentity
       .Filter((boardId, ctx.Sender))
       .Any();
     
     Console.WriteLine($"User {ctx.Sender} access to board {boardId}: {hasAccess}");
   }
   ```

## Performance Issues

### Problem: Infinite Update Loops

**From logs:**
```
Uncaught Svelte error: effect_update_depth_exceeded
Maximum update depth exceeded. This can happen when a reactive block or effect repeatedly sets a new value.
```

**Common Causes:**

1. **Circular dependencies in stores:**
   ```typescript
   // L Creates infinite loop
   class StoreA {
     value = $state(0);
     
     constructor() {
       $effect(() => {
         storeB.setValue(this.value + 1);
       });
     }
   }
   
   class StoreB {
     value = $state(0);
     
     setValue(val: number) {
       this.value = val;
       storeA.value = val - 1; // Circular!
     }
   }
   ```

2. **State mutations in derived values:**
   ```typescript
   // L Wrong
   const computed = $derived(() => {
     this.cache = calculateValue(); // Mutation!
     return this.cache;
   });
   
   //  Correct
   const computed = $derived(() => {
     return calculateValue(); // Pure computation
   });
   
   $effect(() => {
     this.cache = computed; // Mutation in effect
   });
   ```

### Debugging Performance

1. **Add performance markers:**
   ```typescript
   console.time('BoardStore.loadBoards');
   const boards = await loadBoards();
   console.timeEnd('BoardStore.loadBoards');
   ```

2. **Monitor subscription updates:**
   ```typescript
   let updateCount = 0;
   conn.db.card.onUpdate(() => {
     updateCount++;
     console.log(`Card updates: ${updateCount}`);
   });
   ```

## Data Consistency Problems

### Problem: Stale Data After Updates

**Debugging Pattern:**
```typescript
class CardStore {
  private debugMode = true;
  
  async updateCard(cardId: bigint, updates: Partial<Card>) {
    if (this.debugMode) {
      console.log('[CardStore] Before update:', this.cards.get(cardId));
    }
    
    await conn.db.updateCard(cardId, updates);
    
    // Don't rely on immediate local update
    // Wait for server confirmation via onUpdate
    
    if (this.debugMode) {
      setTimeout(() => {
        console.log('[CardStore] After update:', this.cards.get(cardId));
      }, 100);
    }
  }
}
```

### Problem: Missing Related Data

**Example:** Boards show but cards don't

**Solution:**
```typescript
// Ensure all related subscriptions
const subscriptions = [
  'SELECT * FROM board',
  'SELECT * FROM card',
  'SELECT * FROM collaborator',
  'SELECT * FROM user'
];

conn.subscribe(subscriptions, {
  onApplied: () => {
    // Now safe to render UI
    this.dataReady = true;
  }
});
```

## Build and Compilation Errors

### Problem: C# Type Name Warnings

**From logs:**
```
warning CS8981: The type name 'board' only contains lower-cased ascii characters
```

**Solution:**
```csharp
// Use PascalCase for generated types
[Table(Name = "board")]  // DB table name (lowercase)
public partial struct Board  // C# type name (PascalCase)
{
    // ...
}
```

### Problem: Missing Generated Code

**Symptoms:**
- TypeScript can't find types
- "Cannot find module '$lib/generated'"

**Fix:**
```bash
# Regenerate bindings
spacetime generate --lang typescript --project-path ../server --out-dir src/generated

# Verify files exist
ls -la src/generated/
```

## Client-Side Debugging

### Essential Logging Pattern

```typescript
// Create debug logger
const createLogger = (module: string) => {
  const enabled = localStorage.getItem('debug')?.includes(module);
  
  return {
    log: (...args: any[]) => enabled && console.log(`[${module}]`, ...args),
    error: (...args: any[]) => console.error(`[${module}]`, ...args),
    time: (label: string) => enabled && console.time(`[${module}] ${label}`),
    timeEnd: (label: string) => enabled && console.timeEnd(`[${module}] ${label}`)
  };
};

// Usage
const log = createLogger('BoardStore');
log.log('Initializing...');
```

### Browser DevTools Tips

1. **Monitor WebSocket frames:**
   - Network tab ’ WS ’ Select connection
   - View all messages exchanged

2. **Debug Svelte reactivity:**
   ```javascript
   // In console
   $inspect(storeInstance);
   ```

3. **Track store updates:**
   ```typescript
   $effect(() => {
     console.log('Board changed:', board);
   });
   ```

## Server-Side Debugging

### SQL Console Usage

```bash
# Connect to SQL console
spacetime sql kanban-plus

# Useful queries for debugging
> SELECT COUNT(*) FROM board;
> SELECT * FROM user WHERE online = true;
> SELECT b.*, COUNT(c.CardId) as card_count 
  FROM board b 
  LEFT JOIN card c ON b.BoardId = c.BoardId 
  GROUP BY b.BoardId;

# Check reducer execution
> SELECT * FROM __reducer_execution_log ORDER BY timestamp DESC LIMIT 10;
```

### Server Logs

```bash
# View module logs
spacetime logs kanban-plus -f

# Filter for errors
spacetime logs kanban-plus | grep ERROR

# Export logs for analysis
spacetime logs kanban-plus > debug.log
```

### Adding Debug Reducers

```csharp
[Reducer]
public static void DebugDumpTable(ReducerContext ctx, string tableName) {
    switch(tableName) {
        case "board":
            var boards = ctx.Db.board.Iter().ToList();
            Console.WriteLine($"Total boards: {boards.Count}");
            foreach(var board in boards) {
                Console.WriteLine($"Board {board.BoardId}: {board.Title}");
            }
            break;
        // Add other tables...
    }
}
```

## Debugging Tools and Utilities

### 1. Connection Monitor

```typescript
class ConnectionMonitor {
  private reconnectAttempts = 0;
  private maxReconnects = 5;
  
  monitor(conn: SpacetimeDBClient) {
    conn.on('disconnect', () => {
      console.error('Connection lost, attempting reconnect...');
      this.attemptReconnect(conn);
    });
  }
  
  private async attemptReconnect(conn: SpacetimeDBClient) {
    if (this.reconnectAttempts >= this.maxReconnects) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    await new Promise(r => setTimeout(r, 1000 * this.reconnectAttempts));
    
    try {
      await conn.connect();
      this.reconnectAttempts = 0;
    } catch (error) {
      this.attemptReconnect(conn);
    }
  }
}
```

### 2. State Inspector

```typescript
// Add to stores for debugging
class DebugStore {
  inspectState() {
    return {
      boards: this.boards.size,
      cards: this.cards.size,
      users: this.users.size,
      subscriptions: this.subscriptionStatus,
      lastUpdate: this.lastUpdateTime
    };
  }
}

// In console: storeInstance.inspectState()
```

### 3. Performance Profiler

```typescript
class PerformanceProfiler {
  private metrics = new Map<string, number[]>();
  
  measure(operation: string, fn: () => void) {
    const start = performance.now();
    fn();
    const duration = performance.now() - start;
    
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);
  }
  
  report() {
    for (const [op, times] of this.metrics) {
      const avg = times.reduce((a, b) => a + b) / times.length;
      console.log(`${op}: avg ${avg.toFixed(2)}ms`);
    }
  }
}
```

## Debugging Checklist

### Initial Setup
- [ ] SpacetimeDB instance running (`spacetime logs`)
- [ ] Correct WebSocket URL format
- [ ] Database module published successfully
- [ ] TypeScript bindings generated
- [ ] Client can connect to server

### Connection Issues
- [ ] Check network connectivity
- [ ] Verify port 3000 is accessible
- [ ] Confirm module name matches
- [ ] Test with simple ping reducer
- [ ] Check for CORS issues (if applicable)

### Data Not Showing
- [ ] Subscription applied callback fired
- [ ] SQL console shows data exists
- [ ] User has proper authorization
- [ ] Row-level security filters checked
- [ ] Client-side filtering not hiding data

### Performance Problems
- [ ] No infinite loops in effects
- [ ] State mutations outside derived
- [ ] Subscription queries optimized
- [ ] Indexes created for common queries
- [ ] Batch operations where possible

### Build Errors
- [ ] Latest SpacetimeDB SDK version
- [ ] .NET SDK properly installed
- [ ] WASI workload installed
- [ ] Generated code up to date
- [ ] No namespace conflicts

### Production Readiness
- [ ] Error boundaries implemented
- [ ] Reconnection logic in place
- [ ] Logging configured appropriately
- [ ] Performance monitoring enabled
- [ ] Security filters thoroughly tested

## Common Solutions Reference

### Fix Svelte Reactivity Issues
```typescript
// Instead of mutating in derived
const value = $derived(() => {
  doSomething(); // L
  return computeValue();
});

// Use effect for side effects
const value = $derived(() => computeValue());
$effect(() => {
  doSomething(); // 
});
```

### Handle Connection Lifecycle
```typescript
class Store {
  ready = $state(false);
  
  async init() {
    await conn.connect();
    await conn.subscribe(queries, {
      onApplied: () => {
        this.ready = true;
      }
    });
  }
}
```

### Debug Async Operations
```typescript
// Add operation tracking
class OperationTracker {
  private pending = new Map<string, Promise<any>>();
  
  track<T>(id: string, operation: Promise<T>): Promise<T> {
    this.pending.set(id, operation);
    operation.finally(() => this.pending.delete(id));
    return operation;
  }
  
  getPending(): string[] {
    return Array.from(this.pending.keys());
  }
}
```

Remember: Most SpacetimeDB issues stem from subscription timing, identity management, or reactive state handling. Always verify the basics before diving deep into complex debugging!