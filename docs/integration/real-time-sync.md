# Real-Time Sync: SpacetimeDB + Svelte Integration

This guide covers how SpacetimeDB's WebSocket-based real-time sync integrates with Svelte 5's reactive system, creating a seamless live collaboration experience.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [WebSocket Connection Lifecycle](#websocket-connection-lifecycle)
3. [Subscription Patterns](#subscription-patterns)
4. [Svelte Reactivity Integration](#svelte-reactivity-integration)
5. [Optimistic Updates](#optimistic-updates)
6. [Connection Resilience](#connection-resilience)
7. [Multi-Tab Synchronization](#multi-tab-synchronization)
8. [Performance Considerations](#performance-considerations)
9. [Common Issues and Solutions](#common-issues-and-solutions)

## Architecture Overview

The real-time sync architecture consists of three layers:

1. **SpacetimeDB WebSocket Connection**: Maintains persistent connection to the server
2. **Reactive Stores**: Bridge between SpacetimeDB events and Svelte's reactivity
3. **UI Components**: Consume reactive stores and render live updates

```
                      WebSocket                       
  SpacetimeDB    �                  �   Svelte App    
     Server                                            
                                                       
                                                
                                               4        
                                        Connection Store 
                                               ,        
                                                
              Live Events     �                4         
                                         Reactive Stores  
                                        (Board, Card...)  
                                               ,         
                                                
                                               �         
                                         UI Components   
                                                         
```

## WebSocket Connection Lifecycle

### 1. Connection Initialization

The connection is established through `ConnectionInitializer.svelte`, which wraps the entire app:

```typescript
// lib/spacetime.ts
export function connectDb(connectedCb: (conn: DbConnection, id: Identity, tok: string) => void): DbConnection {
  return DbConnection.builder()
    .withUri('ws://localhost:3000')
    .withModuleName('kanban-plus')
    .withToken(localStorage.getItem('auth') ?? '')
    .onConnect((conn: DbConnection, id: Identity, tok: string) => {
      localStorage.setItem('auth', tok);
      connectedCb(conn, id, tok);
    })
    .onConnectError((_ctx: ErrorContext, err: Error) => {
      console.log('error', err);
    })
    .build(); // opens WebSocket
}
```

### 2. Connection State Management

The connection state is managed centrally in `connection-store.svelte.ts`:

```typescript
// Connection store provides reactive access to connection state
export function useConnection() {
  return {
    get conn() { return connection; },
    get id() { return identity; },
    get token() { return token; },
    get isConnected() { return isConnected; }
  };
}
```

### 3. Lifecycle Flow

1. **App Load**: `ConnectionInitializer` renders and attempts connection
2. **Authentication**: Uses stored token or receives new one
3. **Connection Established**: Stores initialized, subscriptions created
4. **Live Sync Active**: Events flow through reactive stores
5. **Disconnection**: Error handling and reconnection logic

## Subscription Patterns

### Basic Subscription Pattern

```typescript
// Example from board-store.svelte.ts
subscription = conn.subscriptionBuilder()
  .onApplied(() => {
    // Initial data load
    boardMap.clear();
    for (const board of conn.db.board.iter()) {
      boardMap.set(board.boardId, board);
    }
    
    // Set up live listeners
    conn.db.board.onInsert((ctx, board) => {
      boardMap.set(board.boardId, board);
      boardMap = new Map(boardMap); // Trigger Svelte reactivity
    });
    
    conn.db.board.onUpdate((_ctx, _old, board) => {
      boardMap.set(board.boardId, board);
      boardMap = new Map(boardMap);
    });
    
    conn.db.board.onDelete((_ctx, board) => {
      boardMap.delete(board.boardId);
      boardMap = new Map(boardMap);
    });
  })
  .subscribe(['SELECT * FROM board']);
```

### Advanced Subscription with Filtering

The global card store demonstrates client-side filtering based on user permissions:

```typescript
// Subscribe to all data, filter client-side
.subscribe([
  'SELECT * FROM card',
  'SELECT * FROM collaborator'
]);

// Then filter in listeners
conn.db.card.onInsert((_ctx, card) => {
  if (this.isUserBoard(card.boardId)) {
    this.addCardToStore(card);
  }
});
```

### Multi-Table Subscriptions

When data relationships matter, subscribe to multiple tables:

```typescript
// Listen for both cards and collaborators
// to maintain access control
conn.db.collaborator.onInsert((_ctx, collab) => {
  if (collab.identity.isEqual(currentUserId)) {
    this.loadBoardCards(collab.boardId);
  }
});

conn.db.collaborator.onDelete((_ctx, collab) => {
  if (collab.identity.isEqual(currentUserId)) {
    this.cardsByBoard.delete(collab.boardId);
  }
});
```

## Svelte Reactivity Integration

### Using $state for Reactive Collections

```typescript
// Reactive map that triggers UI updates
let boardMap = $state<Map<bigint, Board>>(new Map());

// IMPORTANT: Create new Map instance to trigger reactivity
boardMap.set(board.boardId, board);
boardMap = new Map(boardMap); // This triggers Svelte's reactivity
```

### Store Pattern with Reactive Getters

```typescript
export function useBoardStore() {
  return {
    // Reactive getter - UI components will re-render when boardMap changes
    get boards() { return Array.from(boardMap.values()); },
    
    // Direct map access for lookups
    get boardMap() { return boardMap; },
    
    // Methods for mutations
    async createBoard(slug: string, title: string) {
      const { conn } = getConnection();
      await conn.reducers.createBoard(slug, title);
    }
  };
}
```

### Component Usage

```svelte
<script lang="ts">
  import { useBoardStore } from '$lib/stores/board-store.svelte';
  
  const boardStore = useBoardStore();
  
  // This will automatically update when boards change
  $: boards = boardStore.boards;
</script>

{#each boards as board}
  <BoardCard {board} />
{/each}
```

## Optimistic Updates

SpacetimeDB handles optimistic updates automatically through its event system:

### How It Works

1. **Reducer Call**: Client calls a reducer method
2. **Optimistic Event**: SpacetimeDB immediately fires a local event
3. **UI Update**: Store listeners update state instantly
4. **Server Confirmation**: Server processes and confirms/rejects
5. **Rollback if Needed**: On rejection, compensating events restore state

### Example Flow

```typescript
// User action
async function handleAddCard() {
  // This call returns immediately
  await conn.reducers.addCard(boardId, title);
  // UI updates optimistically via onInsert listener
}

// Store listener handles both optimistic and confirmed events
conn.db.card.onInsert((ctx, card) => {
  console.log('Card inserted:', card, 'Event:', ctx.event);
  // ctx.event indicates if this is optimistic or confirmed
  cardMap.set(card.cardId, card);
});
```

## Connection Resilience

### Handling Connection Loss

```typescript
// In spacetime.ts
.onConnectError((_ctx: ErrorContext, err: Error) => {
  console.log('Connection error:', err);
  // Could trigger reconnection logic here
})

// In stores, handle subscription errors
.onError((ctx) => {
  console.error('Subscription error:', ctx);
  this.error = 'Subscription failed';
})
```

### Reconnection Strategy

```typescript
// Example reconnection implementation
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function attemptReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    showError('Unable to reconnect. Please refresh the page.');
    return;
  }
  
  reconnectAttempts++;
  setTimeout(() => {
    connectDb((conn, id, tok) => {
      reconnectAttempts = 0;
      reinitializeStores();
    });
  }, Math.min(1000 * Math.pow(2, reconnectAttempts), 30000));
}
```

## Multi-Tab Synchronization

### Authentication Token Sharing

Tokens are stored in localStorage, allowing multiple tabs to share authentication:

```typescript
// Token persisted across tabs
.withToken(localStorage.getItem('auth') ?? '')
.onConnect((conn: DbConnection, id: Identity, tok: string) => {
  localStorage.setItem('auth', tok);
  // All tabs share the same identity
})
```

### Live Updates Across Tabs

Each tab maintains its own WebSocket connection, receiving independent event streams:

```typescript
// Each tab's store maintains its own state
// but all receive the same events from the server
conn.db.board.onUpdate((_ctx, _old, board) => {
  // This fires in all connected tabs
  boardMap.set(board.boardId, board);
});
```

### Considerations

- Each tab consumes a WebSocket connection
- State is duplicated across tabs (not shared in memory)
- Actions in one tab appear instantly in others
- Token refresh affects all tabs

## Performance Considerations

### 1. Subscription Granularity

```typescript
// L Avoid: Subscribing to everything
.subscribe(['SELECT * FROM card', 'SELECT * FROM board', 'SELECT * FROM user'])

//  Better: Subscribe only to what you need
.subscribe([
  'SELECT * FROM card WHERE board_id IN (SELECT board_id FROM collaborator WHERE identity = $1)',
  'SELECT * FROM board WHERE board_id IN (SELECT board_id FROM collaborator WHERE identity = $1)'
])
```

### 2. Batching Updates

```typescript
// Use single Map update for multiple changes
private batchUpdateCards(updates: Card[]) {
  const boardData = this.cardsByBoard.get(boardId);
  
  // Make all changes
  for (const card of updates) {
    boardData.cards.set(card.cardId, card);
  }
  
  // Single reactivity trigger
  this.cardsByBoard = new Map(this.cardsByBoard);
}
```

### 3. Memory Management

```typescript
// Clean up subscriptions when not needed
destroy() {
  if (this.subscription) {
    this.subscription.unsubscribe();
    this.subscription = null;
  }
  this.cardsByBoard.clear();
}
```

### 4. Lazy Loading Pattern

```typescript
// Load board details only when accessed
private loadBoardIfNeeded(boardId: bigint) {
  if (!this.loadedBoards.has(boardId)) {
    this.subscription = conn.subscriptionBuilder()
      .subscribe([`SELECT * FROM card WHERE board_id = ${boardId}`]);
    this.loadedBoards.add(boardId);
  }
}
```

## Common Issues and Solutions

### Issue 1: Reactivity Not Triggering

**Problem**: Updates to Maps/Sets don't trigger Svelte reactivity

**Solution**: Create new instances
```typescript
// L Won't trigger update
boardMap.set(id, board);

//  Will trigger update
boardMap.set(id, board);
boardMap = new Map(boardMap);
```

### Issue 2: Duplicate Events

**Problem**: Multiple listeners firing for the same event

**Solution**: Initialize stores once
```typescript
let initialized = false;

export function initializeBoardStore() {
  if (initialized) {
    console.log('Already initialized, skipping');
    return;
  }
  initialized = true;
  // ... setup subscriptions
}
```

### Issue 3: Missing Initial Data

**Problem**: UI shows empty state before subscription data arrives

**Solution**: Use subscription's `onApplied` callback
```typescript
.onApplied(() => {
  // Load initial data first
  for (const board of conn.db.board.iter()) {
    boardMap.set(board.boardId, board);
  }
  
  // Then set up listeners
  conn.db.board.onInsert((ctx, board) => {
    // Handle new inserts
  });
})
```

### Issue 4: Permission-Based Visibility

**Problem**: Users see data they shouldn't have access to

**Solution**: Client-side filtering with server-side enforcement
```typescript
private isUserBoard(boardId: bigint): boolean {
  const { conn, id: currentUserId } = getConnection();
  
  for (const collab of conn.db.collaborator.iter()) {
    if (collab.boardId === boardId && collab.identity.isEqual(currentUserId)) {
      return true;
    }
  }
  return false;
}

// Always check permissions before displaying
if (this.isUserBoard(card.boardId)) {
  this.addCardToStore(card);
}
```

### Issue 5: Connection State During Development

**Problem**: Hot reload causes connection issues

**Solution**: Proper cleanup and state management
```typescript
// In development, clean up on unmount
onDestroy(() => {
  if (import.meta.env.DEV) {
    store.destroy();
  }
});
```

## Best Practices Summary

1. **Initialize Once**: Use singleton stores and initialization guards
2. **Clean Subscriptions**: Always unsubscribe when components unmount
3. **Batch Updates**: Group related changes to minimize reactivity triggers
4. **Filter Client-Side**: When server-side filtering isn't available
5. **Handle Errors**: Implement proper error boundaries and recovery
6. **Monitor Performance**: Watch for subscription count and data volume
7. **Test Multi-Tab**: Ensure consistency across browser tabs
8. **Document Assumptions**: Make data flow and permissions explicit

## Next Steps

- Implement advanced features like offline support
- Add WebSocket reconnection with exponential backoff
- Create debugging tools for subscription monitoring
- Build performance dashboards for real-time metrics