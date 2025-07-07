# Svelte 5 Runes and Reactivity Guide

This guide covers Svelte 5's new runes system, focusing on practical patterns and pitfalls discovered while building our Kanban application with SpacetimeDB.

## Table of Contents

1. [What Are Runes?](#what-are-runes)
2. [Core Runes](#core-runes)
3. [State Mutation Pitfalls](#state-mutation-pitfalls)
4. [Migration from Svelte 4](#migration-from-svelte-4)
5. [Best Practices](#best-practices)
6. [Real-World Examples](#real-world-examples)

## What Are Runes?

Runes are Svelte 5's new reactivity primitives, replacing the implicit reactivity of Svelte 4. They provide explicit, predictable reactivity with better TypeScript support and clearer boundaries between reactive and non-reactive code.

**Key Benefits:**
- Explicit reactivity declarations
- Better TypeScript integration
- Works outside `.svelte` files (in `.ts` files)
- More predictable behavior
- Fine-grained reactivity control

## Core Runes

### `$state` - Reactive State

Creates reactive state that triggers updates when mutated.

```typescript
// Simple values
let count = $state(0);
let message = $state('Hello');

// Objects and arrays
let user = $state({ name: 'John', age: 30 });
let items = $state<string[]>([]);

// Maps and complex types (from our codebase)
let boardMap = $state<Map<bigint, Board>>(new Map());
```

**From our board store:**
```typescript
// client/src/lib/stores/board-store.svelte.ts
let boardMap = $state<Map<bigint, Board>>(new Map());
let activeBoard = $state<bigint | null>(null);
```

### `$derived` - Computed Values

Creates values that automatically update when their dependencies change.

```typescript
const doubled = $derived(count * 2);
const fullName = $derived(`${user.firstName} ${user.lastName}`);
```

**From our BoardList component:**
```typescript
// client/src/lib/components/BoardList.svelte
const totalCards = $derived(activityStore.getTotalCardCount());
```

### `$effect` - Side Effects

Runs code when dependencies change. Similar to Svelte 4's `$:` reactive statements.

```typescript
$effect(() => {
  console.log(`Count is now: ${count}`);
  // This runs whenever 'count' changes
});
```

### `$props` - Component Props

Declares component props with TypeScript support.

```typescript
interface Props {
  title: string;
  count?: number;
}

let { title, count = 0 }: Props = $props();
```

## State Mutation Pitfalls

### The Critical Error We Encountered

Our application hit a common but serious error when trying to mutate state inside a `$derived` expression:

```
Uncaught Svelte error: state_unsafe_mutation
Updating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden.
```

**The Problem Code:**

In our `ActivityStore`, we were modifying state inside `getBoardActivity()` which was called from a `$derived`:

```typescript
// L BAD: Mutating state inside a derived/template expression
getBoardActivity(boardId: bigint): BoardActivity {
  // ... calculation logic ...
  
  // This line causes the error!
  this.activityCache.set(boardId, activity);
  
  return activity;
}

// In BoardList.svelte - this triggers the error
{#each boardStore.boards as board}
  {@const activity = getBoardActivity(board.boardId)}
{/each}
```

### Why This Happens

Svelte 5 enforces strict separation between:
1. **Read contexts** (derived, template expressions) - Can only read state
2. **Write contexts** (effects, event handlers) - Can read and write state

This prevents:
- Infinite loops
- Unpredictable state updates
- Performance issues

### Solutions

#### Solution 1: Use Non-Reactive State for Caches

```typescript
//  GOOD: Use plain Map for caches that don't need reactivity
class ActivityStore {
  // Not reactive - just a plain Map
  private activityCache = new Map<bigint, BoardActivity>();
  
  // Reactive state for things that need to trigger updates
  private lastViewedMap = $state<Map<bigint, Date>>(new Map());
}
```

#### Solution 2: Pre-compute in Effects

```typescript
//  GOOD: Update cache in an effect
class ActivityStore {
  private activityCache = $state<Map<bigint, BoardActivity>>(new Map());
  
  constructor() {
    // Update cache when dependencies change
    $effect(() => {
      const boardIds = this.getLoadedBoardIds();
      const newCache = new Map();
      
      for (const boardId of boardIds) {
        const activity = this.calculateActivity(boardId);
        newCache.set(boardId, activity);
      }
      
      this.activityCache = newCache;
    });
  }
  
  // Now this just reads from the cache
  getBoardActivity(boardId: bigint): BoardActivity {
    return this.activityCache.get(boardId) || this.getDefaultActivity();
  }
}
```

#### Solution 3: Separate Read and Write Operations

```typescript
//  GOOD: Explicit cache management
class ActivityStore {
  private activityCache = new Map<bigint, BoardActivity>();
  
  // Read operation - safe in derived/template
  getBoardActivity(boardId: bigint): BoardActivity {
    const cached = this.activityCache.get(boardId);
    if (cached) return cached;
    
    // Calculate without side effects
    return this.calculateActivity(boardId);
  }
  
  // Write operation - call from event handlers
  updateActivityCache(boardId: bigint) {
    const activity = this.calculateActivity(boardId);
    this.activityCache.set(boardId, activity);
  }
}
```

## Migration from Svelte 4

### Store Pattern Changes

**Svelte 4:**
```typescript
import { writable, derived } from 'svelte/store';

const count = writable(0);
const doubled = derived(count, $count => $count * 2);

// In component
$count += 1;
```

**Svelte 5:**
```typescript
// In a .svelte.ts file
let count = $state(0);
const doubled = $derived(count * 2);

// In component
count += 1;
```

### Reactive Statements

**Svelte 4:**
```svelte
<script>
  let count = 0;
  $: console.log(`Count is ${count}`);
  $: doubled = count * 2;
</script>
```

**Svelte 5:**
```svelte
<script>
  let count = $state(0);
  const doubled = $derived(count * 2);
  
  $effect(() => {
    console.log(`Count is ${count}`);
  });
</script>
```

## Best Practices

### 1. Use the Right Rune for the Job

```typescript
// State that changes
let isLoading = $state(false);

// Computed values
const buttonText = $derived(isLoading ? 'Loading...' : 'Submit');

// Side effects
$effect(() => {
  if (isLoading) {
    trackAnalytics('loading_started');
  }
});
```

### 2. Keep Stores Simple and Focused

Our pattern for SpacetimeDB stores:

```typescript
// board-store.svelte.ts
export function useBoardStore() {
  return {
    // Reactive getters
    get boards() { return Array.from(boardMap.values()); },
    get activeBoard() { return activeBoard; },
    
    // Methods for mutations
    setActiveBoard(boardId: bigint | null) {
      activeBoard = boardId;
    },
    
    // Async operations
    async createBoard(slug: string, title: string) {
      const { conn } = getConnection();
      await conn.reducers.createBoard(slug, title);
    }
  };
}
```

### 3. Handle Collections Carefully

When working with Maps and Sets, create new instances to trigger reactivity:

```typescript
//  GOOD: Creates new Map to trigger updates
boardMap.set(board.boardId, board);
boardMap = new Map(boardMap); // Trigger reactivity

// L BAD: Mutation without triggering updates
boardMap.set(board.boardId, board);
// Components won't update!
```

### 4. Separate Concerns

Keep reactive state, derived values, and effects organized:

```typescript
class Store {
  // 1. Reactive state at the top
  private items = $state<Item[]>([]);
  private filter = $state('');
  
  // 2. Derived values
  get filteredItems() {
    return $derived(
      this.items.filter(item => 
        item.name.includes(this.filter)
      )
    );
  }
  
  // 3. Effects in constructor
  constructor() {
    $effect(() => {
      console.log(`Filtered to ${this.filteredItems.length} items`);
    });
  }
  
  // 4. Methods for mutations
  addItem(item: Item) {
    this.items = [...this.items, item];
  }
}
```

## Real-World Examples

### Example 1: Global Card Store with Reactive Updates

```typescript
// From client/src/lib/stores/global-card-store.svelte.ts
class GlobalCardStore {
  // Reactive state for UI updates
  private cardsByBoard = $state<Map<bigint, BoardCardData>>(new Map());
  private isInitialized = $state(false);
  private error = $state<string | null>(null);
  
  // Non-reactive state for internal use
  private subscription: { unsubscribe: () => void } | null = null;
  
  private addCardToStore(card: Card) {
    let boardData = this.cardsByBoard.get(card.boardId);
    
    if (!boardData) {
      boardData = {
        cards: new Map(),
        lastUpdate: new Date()
      };
      this.cardsByBoard.set(card.boardId, boardData);
    }
    
    boardData.cards.set(card.cardId, card);
    boardData.lastUpdate = new Date();
    
    // Trigger reactivity by creating new Map
    this.cardsByBoard = new Map(this.cardsByBoard);
  }
  
  // Safe getter that doesn't mutate
  getCardsForBoard(boardId: bigint): Card[] {
    const boardData = this.cardsByBoard.get(boardId);
    return boardData ? Array.from(boardData.cards.values()) : [];
  }
}
```

### Example 2: Component with Derived State

```svelte
<!-- From client/src/lib/components/BoardList.svelte -->
<script lang="ts">
  import { useBoardStore } from '$lib/stores/board-store.svelte';
  import { useActivityStore } from '$lib/stores/activity-store.svelte';
  
  const boardStore = useBoardStore();
  const activityStore = useActivityStore();
  
  // Reactive state for form
  let newSlug = $state('');
  let newTitle = $state('');
  
  // Derived value - recalculates when dependencies change
  const totalCards = $derived(activityStore.getTotalCardCount());
  
  // Event handler - safe place to mutate state
  async function createBoard() {
    if (!newSlug || !newTitle) return;
    await boardStore.createBoard(newSlug, newTitle);
    newSlug = '';
    newTitle = '';
  }
</script>

<!-- Template expressions are read-only contexts -->
{#each boardStore.boards as board}
  <!-- This must not mutate state! -->
  {@const activity = activityStore.getBoardActivity(board.boardId)}
  <li>
    <span>{board.title}</span>
    <span>{activity.todoCount} tasks</span>
  </li>
{/each}
```

### Example 3: Fixing the State Mutation Error

**Before (Causes Error):**
```typescript
class ActivityStore {
  private activityCache = new Map<bigint, BoardActivity>();
  
  getBoardActivity(boardId: bigint): BoardActivity {
    // L This mutates state in a read context!
    const activity = this.calculateActivity(boardId);
    this.activityCache.set(boardId, activity);
    return activity;
  }
}
```

**After (Fixed):**
```typescript
class ActivityStore {
  // Option 1: Make cache non-reactive (simplest)
  private activityCache = new Map<bigint, BoardActivity>();
  
  // Option 2: Use reactive cache with proper updates
  private activityCache = $state<Map<bigint, BoardActivity>>(new Map());
  
  constructor() {
    // Update cache in effect when data changes
    $effect(() => {
      const { conn } = getConnection();
      
      // React to card table changes
      conn.db.card.onInsert(() => this.invalidateCache());
      conn.db.card.onUpdate(() => this.invalidateCache());
      conn.db.card.onDelete(() => this.invalidateCache());
    });
  }
  
  private invalidateCache() {
    // Clear cache in write context
    this.activityCache = new Map();
  }
  
  getBoardActivity(boardId: bigint): BoardActivity {
    //  Just read from cache, no mutations
    let activity = this.activityCache.get(boardId);
    
    if (!activity) {
      // Calculate without side effects
      activity = this.calculateActivity(boardId);
      
      // Store in cache later, in a write context
      queueMicrotask(() => {
        this.activityCache.set(boardId, activity);
        this.activityCache = new Map(this.activityCache);
      });
    }
    
    return activity;
  }
}
```

## Summary

Svelte 5's runes provide a more explicit and powerful reactivity system, but require understanding the boundaries between read and write contexts. Key takeaways:

1. **Use `$state` for reactive data** that needs to trigger UI updates
2. **Use `$derived` for computed values** that depend on other reactive state
3. **Never mutate state inside `$derived` or template expressions**
4. **Keep caches and internal state non-reactive** unless they need to trigger updates
5. **Create new instances of collections** to trigger reactivity
6. **Organize code clearly** with state, derived values, effects, and methods separated

By following these patterns, you can build robust, performant applications with Svelte 5 and avoid common pitfalls like the state mutation errors we encountered.