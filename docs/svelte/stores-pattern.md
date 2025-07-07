# Svelte Store Architecture for SpacetimeDB

This guide documents the store architecture used in our Kanban application, showcasing best practices for integrating Svelte 5's reactive stores with SpacetimeDB's real-time synchronization capabilities.

## Overview

Our store architecture leverages Svelte 5's new runes system (`$state`, `$derived`, `$effect`) combined with class-based stores and the singleton pattern. This approach provides:

- **Type-safe reactive state management** using TypeScript classes
- **Real-time synchronization** with SpacetimeDB subscriptions
- **Optimized performance** through careful subscription management
- **Clean separation of concerns** between UI state and database operations

## Core Architecture Patterns

### 1. Module-Based State with Runes

Instead of using Svelte's traditional stores, we use module-level state with the `$state` rune:

```typescript
// connection-store.svelte.ts
let connection = $state<DbConnection | undefined>();
let identity = $state<Identity | undefined>();
let token = $state<string | undefined>();
let isConnected = $state(false);

export function setConnection(conn: DbConnection, id: Identity, tok: string) {
  connection = conn;
  identity = id;
  token = tok;
  isConnected = true;
}

export function useConnection() {
  return {
    get conn() { return connection; },
    get id() { return identity; },
    get token() { return token; },
    get isConnected() { return isConnected; }
  };
}
```

### 2. Class-Based Stores with Singleton Pattern

For complex state management, we use classes with the singleton pattern:

```typescript
// global-card-store.svelte.ts
class GlobalCardStore {
  private cardsByBoard = $state<Map<bigint, BoardCardData>>(new Map());
  private subscription: { unsubscribe: () => void } | null = null;
  private isInitialized = $state(false);
  private error = $state<string | null>(null);

  constructor() {
    this.initialize();
  }

  // ... implementation
}

// Singleton instance
let globalCardStore: GlobalCardStore | null = null;

export function useGlobalCardStore() {
  if (!globalCardStore) {
    globalCardStore = new GlobalCardStore();
  }
  return globalCardStore;
}
```

### 3. Store Initialization Pattern

Stores are initialized in a specific order after the SpacetimeDB connection is established:

```typescript
// ConnectionInitializer.svelte
connectDb((conn, id, tok) => {
  setConnection(conn, id, tok);
  
  // Initialize global stores after connection is established
  initializeUserStore();
  initializeBoardStore();
});
```

## Store Types and Responsibilities

### Connection Store
- **Purpose**: Manages the SpacetimeDB connection lifecycle
- **Pattern**: Module-level state with getter functions
- **Key Features**: Single source of truth for connection state

### User Store
- **Purpose**: Manages user data and current user state
- **Pattern**: Module-level state with initialization function
- **Key Features**: 
  - Subscribes to user table
  - Maintains user map for quick lookups
  - Tracks current user separately

### Board Store
- **Purpose**: Manages board data and active board selection
- **Pattern**: Module-level state with subscription management
- **Key Features**:
  - Maintains board map with bigint keys
  - Tracks active board selection
  - Handles board CRUD operations

### Global Card Store
- **Purpose**: Manages cards across all boards the user has access to
- **Pattern**: Class-based singleton with complex subscription logic
- **Key Features**:
  - Groups cards by board for efficient access
  - Filters based on user's collaborator access
  - Provides card operation methods

### Global Collaborator Store
- **Purpose**: Manages collaborator data across boards
- **Pattern**: Class-based singleton similar to card store
- **Key Features**:
  - Tracks collaborators by board
  - Handles access control updates
  - Provides collaboration methods

### Activity Store
- **Purpose**: Tracks board activity and last viewed timestamps
- **Pattern**: Class-based singleton with localStorage persistence
- **Key Features**:
  - Calculates activity summaries
  - Persists viewing history
  - Provides notification-like functionality

### Board Viewer Store
- **Purpose**: Manages real-time presence for board viewers
- **Pattern**: Class-based singleton with lifecycle management
- **Key Features**:
  - Tracks active viewers per board
  - Manages ping intervals
  - Provides presence hook

## SpacetimeDB Integration Patterns

### 1. Subscription Management

Stores subscribe to SpacetimeDB tables with careful initialization:

```typescript
// user-store.svelte.ts
export function initializeUserStore() {
  if (initialized) return;
  initialized = true;

  const { conn, id } = getConnection();

  // Subscribe first without listeners to get initial data
  conn.subscriptionBuilder()
    .onApplied(() => {
      console.log('[UserStore] User subscription applied');
      
      // Load initial data from cache
      const cachedUser = conn.db.user.id.find(id);
      if (cachedUser) {
        currentUser = cachedUser;
      }
      
      // Set up listeners after initial data is loaded
      conn.db.user.onInsert((_ctx, user) => {
        userMap.set(user.id.toHexString(), user);
        userMap = new Map(userMap); // Trigger reactivity
      });
      
      // ... more listeners
    })
    .subscribe(['SELECT * FROM user']);
}
```

### 2. Reactivity Triggers

To ensure Svelte's reactivity system detects changes to Maps and Sets:

```typescript
// Trigger reactivity by creating new Map instance
userMap.set(user.id.toHexString(), user);
userMap = new Map(userMap); // This triggers reactivity
```

### 3. Row-Level Security Integration

Stores respect SpacetimeDB's row-level security by filtering data client-side:

```typescript
// global-card-store.svelte.ts
private isUserBoard(boardId: bigint): boolean {
  const { conn, id: currentUserId } = getConnection();
  
  for (const collab of conn.db.collaborator.iter()) {
    if (collab.boardId === boardId && collab.identity.isEqual(currentUserId!)) {
      return true;
    }
  }
  return false;
}
```

### 4. Optimistic Updates

Stores delegate operations to SpacetimeDB reducers for optimistic updates:

```typescript
// global-card-store.svelte.ts
async addCard(boardId: bigint, title: string) {
  const { conn } = getConnection();
  await conn.reducers.addCard(boardId, title);
  // The onInsert listener will handle the UI update
}
```

## Inter-Store Communication

Stores can depend on each other through imports:

```typescript
// activity-store.svelte.ts
import { useGlobalCardStore } from './global-card-store.svelte';
import { useGlobalCollaboratorStore } from './global-collaborator-store.svelte';

class ActivityStore {
  getBoardActivity(boardId: bigint): BoardActivity {
    const cardStore = useGlobalCardStore();
    const cards = cardStore.getCardsForBoard(boardId);
    // ... calculate activity
  }
}
```

## Testing Considerations

### 1. Mock Connection

For testing stores in isolation:

```typescript
// test-utils.ts
export function mockConnection() {
  const mockConn = {
    db: {
      user: {
        iter: () => [],
        onInsert: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn()
      }
    },
    reducers: {
      setUserName: vi.fn()
    }
  };
  
  setConnection(mockConn as any, mockIdentity, 'test-token');
}
```

### 2. Store Reset

Ensure stores can be reset between tests:

```typescript
// In test setup
beforeEach(() => {
  // Reset singleton instances
  globalCardStore = null;
  globalCollaboratorStore = null;
  activityStore = null;
});
```

### 3. Subscription Cleanup

Always clean up subscriptions to prevent memory leaks:

```typescript
destroy() {
  if (this.subscription) {
    this.subscription.unsubscribe();
    this.subscription = null;
  }
  this.cardsByBoard.clear();
  this.isInitialized = false;
}
```

## Best Practices

1. **Initialize Once**: Use initialization flags to prevent duplicate subscriptions
2. **Error Handling**: Track error states in stores for UI feedback
3. **Logging**: Use consistent naming for console logs (e.g., `[StoreName]`)
4. **Type Safety**: Leverage TypeScript for all store interfaces
5. **Reactivity**: Always create new instances of Maps/Sets to trigger updates
6. **Cleanup**: Implement destroy methods for subscription cleanup
7. **Performance**: Use Maps for O(1) lookups instead of arrays
8. **Persistence**: Use localStorage for UI state that should survive refreshes

## Example Usage in Components

```svelte
<script lang="ts">
  import { useBoardStore } from '$lib/stores';
  import { useGlobalCardStore } from '$lib/stores';
  
  const boardStore = useBoardStore();
  const cardStore = useGlobalCardStore();
  
  // Reactive derived values
  const cards = $derived(cardStore.getCardsForBoard(boardId));
  const todoCount = $derived(cards.filter(c => c.state === 'todo').length);
  
  async function handleAddCard() {
    await cardStore.addCard(boardId, title);
    // UI updates automatically via subscription
  }
</script>

<div>
  <h2>{boardStore.getBoard(boardId)?.title}</h2>
  <p>Todo items: {todoCount}</p>
  
  {#each cards as card}
    <Card {card} />
  {/each}
</div>
```

## Conclusion

This store architecture provides a robust foundation for building real-time collaborative applications with SpacetimeDB and Svelte 5. The combination of reactive stores, type safety, and careful subscription management ensures excellent performance and developer experience.