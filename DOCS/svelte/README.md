# Svelte 5 Documentation

This section covers our use of Svelte 5 with its new runes-based reactivity system in building a real-time collaborative application with SpacetimeDB.

## 🎯 What's New in Svelte 5?

Svelte 5 introduces **runes** - a new reactivity system that replaces the old `$:` reactive statements and store subscriptions with explicit reactive primitives:

- `$state()` - Reactive state declaration
- `$derived()` - Computed values
- `$effect()` - Side effects
- `$props()` - Component props with reactivity

## 📚 Documentation

### Core Concepts
- [Runes and Reactivity](runes-and-reactivity.md) - The new reactivity system explained
- [Stores Pattern](stores-pattern.md) - Our reactive store architecture
- [Component Patterns](component-patterns.md) - Building reusable components

### Integration & Optimization
- [State Management](state-management.md) - Integrating with SpacetimeDB
- [Performance](performance.md) - Optimization techniques for real-time apps

## 🚀 Quick Example

Here's how we use Svelte 5 runes with SpacetimeDB:

**Reactive Store** (`client/src/lib/stores/board-store.svelte.ts:14`):
```typescript
class BoardStore {
    boards = $state<Map<bigint, BoardType>>(new Map());
    selectedBoard = $state<BoardType | null>(null);
    
    // Derived state
    boardCount = $derived(this.boards.size);
    
    constructor() {
        // Subscribe to SpacetimeDB changes
        $effect(() => {
            const unsubscribe = Board.onInsert((board) => {
                this.boards.set(board.boardId, board);
            });
            
            return () => unsubscribe();
        });
    }
}

export const boardStore = new BoardStore();
```

**Component Usage** (`client/src/lib/components/BoardList.svelte:45`):
```svelte
<script lang="ts">
    import { boardStore } from '$lib/stores/board-store.svelte';
    
    // Props with default values
    let { onSelect = () => {} } = $props();
    
    // Derived state
    const sortedBoards = $derived(
        Array.from(boardStore.boards.values())
            .sort((a, b) => b.createdAt - a.createdAt)
    );
</script>

{#each sortedBoards as board}
    <BoardCard {board} {onSelect} />
{/each}
```

## 🔧 Current Implementation

Our Kanban application showcases:

### Store Architecture
- `connection-store.svelte.ts` - WebSocket connection management
- `user-store.svelte.ts` - User presence and authentication
- `board-store.svelte.ts` - Board CRUD and selection
- `global-card-store.svelte.ts` - Card management across boards
- `activity-store.svelte.ts` - Real-time activity tracking

### Component Patterns
- `ConnectionInitializer.svelte` - Handles SpacetimeDB connection lifecycle
- `BoardView.svelte` - Main board display with live updates
- `CardItem.svelte` - Draggable cards with optimistic updates
- `UserProfile.svelte` - Real-time presence indicators

## ⚡ Key Patterns We Use

1. **Class-based Stores**: Using classes with `$state` for complex state management
2. **Fine-grained Reactivity**: Only updating what changes with `$derived`
3. **Effect Cleanup**: Properly unsubscribing from SpacetimeDB events
4. **Optimistic Updates**: Immediate UI updates before server confirmation
5. **Type Safety**: Full TypeScript integration with generated types

## 🐛 Common Issues & Solutions

From our experience (`DEBUG/logs/no-data.md`):

### 1. State Mutation Errors
```
Uncaught Svelte error: state_unsafe_mutation
Updating state inside $derived(...) is forbidden
```

**Solution**: Move mutations outside of derived computations:
```typescript
// ❌ Bad
const sorted = $derived(() => {
    this.cache = data; // Error!
    return data.sort();
});

// ✅ Good
$effect(() => {
    this.cache = data; // Safe in effect
});
const sorted = $derived(data.sort());
```

### 2. Store Subscription Timing
SpacetimeDB subscriptions need careful lifecycle management with Svelte's reactivity.

See [State Management](state-management.md) for detailed patterns.

## 📊 Performance Characteristics

- **Reactivity**: Fine-grained updates only re-render affected components
- **Bundle Size**: ~10KB smaller than Svelte 4 equivalent
- **Memory**: Efficient subscription management prevents leaks
- **Rendering**: Batched updates for smooth 60fps with 100s of items

## 🔗 Resources

- [Svelte 5 Docs](https://svelte.dev/docs/svelte/overview)
- [Runes Tutorial](https://learn.svelte.dev/tutorial/runes)
- [Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)

## 🎯 Next Steps

1. Learn about [Runes and Reactivity](runes-and-reactivity.md)
2. Understand our [Store Pattern](stores-pattern.md)
3. See [State Management](state-management.md) with SpacetimeDB
4. Review [Component Patterns](component-patterns.md) for best practices

---

*Last Updated: 2025-01-03*