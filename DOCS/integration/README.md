# Integration Documentation

This section covers how SpacetimeDB, Svelte 5, and Claude Code work together to create a powerful real-time development stack.

## 🎯 The Integration Stack

Our stack combines:
- **SpacetimeDB** - Real-time database with server-side logic
- **Svelte 5** - Reactive UI framework with fine-grained updates
- **Claude Code** - AI-powered development assistant
- **TypeScript** - End-to-end type safety

## 📚 Documentation

### Core Integration Topics
- [Real-Time Sync](real-time-sync.md) - Live data synchronization patterns
- [Type Safety](type-safety.md) - End-to-end type safety from database to UI

### Development & Deployment
- [Development Workflow](development-workflow.md) - Local development setup and hot reload
- [Deployment](deployment.md) - Production deployment considerations

## 🚀 Integration Architecture

### Data Flow
```
SpacetimeDB (C#)          TypeScript SDK         Svelte 5 UI
┌─────────────┐          ┌──────────────┐      ┌─────────────┐
│   Tables    │          │  Generated   │      │   Stores    │
│      ↓      │  ──ws──> │    Types     │ ───> │      ↓      │
│  Reducers   │          │      ↓       │      │ Components  │
│      ↓      │  <─ws──  │   Reducers   │ <─── │      ↓      │
│   Events    │          │      ↓       │      │   Runes     │
└─────────────┘          └──────────────┘      └─────────────┘
```

### Real Example

**1. Server Reducer** (`server/domains/Cards.cs:25`):
```csharp
[SpacetimeDB.Reducer]
public static void CompleteCard(ReducerContext ctx, ulong cardId)
{
    var card = Card.FilterByCardId(cardId).First();
    card.State = CardState.Done;
    card.CompletedAt = ctx.Timestamp;
    Card.UpdateByCardId(cardId, card);
}
```

**2. Generated TypeScript** (`client/src/lib/generated/complete_card_reducer.ts`):
```typescript
export function CompleteCardReducer(cardId: bigint) {
    return EventEmitter.call("CompleteCard", { cardId });
}
```

**3. Svelte Store** (`client/src/lib/stores/card-store.svelte.ts:80`):
```typescript
class CardStore {
    cards = $state<Map<bigint, CardType>>(new Map());
    
    completeCard(cardId: bigint) {
        // Optimistic update
        const card = this.cards.get(cardId);
        if (card) {
            card.state = 'done';
            this.cards.set(cardId, { ...card });
        }
        
        // Server call
        CompleteCardReducer.call(cardId);
    }
}
```

**4. Svelte Component** (`client/src/lib/components/CardItem.svelte`):
```svelte
<script lang="ts">
    let { card } = $props();
    const { completeCard } = cardStore;
</script>

<button onclick={() => completeCard(card.cardId)}>
    Complete
</button>
```

## 🔧 Key Integration Points

### 1. WebSocket Connection
- Managed by `client/src/lib/spacetime.ts`
- Auto-reconnection with exponential backoff
- Connection state in `connection-store.svelte.ts`

### 2. Type Generation
```bash
spacetime generate --lang typescript \
  --project-path ../server \
  --out-dir src/lib/generated
```

### 3. Subscription Management
- SpacetimeDB subscriptions in Svelte effects
- Proper cleanup on component unmount
- Reactive updates via Svelte runes

### 4. Authentication Flow
- Identity provided by SpacetimeDB
- Stored in browser localStorage
- Automatic reconnection with same identity

## ⚡ Integration Patterns

### 1. Optimistic Updates
```typescript
// Update UI immediately
this.localState = newValue;
// Then sync with server
Reducer.call(newValue);
```

### 2. Real-Time Subscriptions
```typescript
$effect(() => {
    const unsub = Table.onInsert((row) => {
        this.items.set(row.id, row);
    });
    return () => unsub();
});
```

### 3. Error Handling
```typescript
try {
    await Reducer.call(params);
} catch (error) {
    // Rollback optimistic update
    this.localState = previousValue;
}
```

## 🐛 Common Integration Issues

### 1. State Mutation in Derived
- **Issue**: Svelte prevents mutations in `$derived`
- **Solution**: Use `$effect` for side effects

### 2. WebSocket Reconnection
- **Issue**: Lost subscriptions on disconnect
- **Solution**: Re-subscribe in connection handler

### 3. Type Mismatches
- **Issue**: Generated types out of sync
- **Solution**: Regenerate after schema changes

## 📊 Performance Considerations

- **Batching**: SpacetimeDB batches updates
- **Debouncing**: Throttle rapid UI updates
- **Memoization**: Use `$derived` for expensive computations
- **Virtualization**: For large lists (100+ items)

## 🔗 Resources

- [SpacetimeDB + TypeScript Guide](https://docs.spacetimedb.com/languages/typescript)
- [Svelte 5 Reactivity](https://svelte.dev/docs/svelte/reactivity)
- [WebSocket Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

## 🎯 Next Steps

1. Understand [Real-Time Sync](real-time-sync.md) patterns
2. Master [Type Safety](type-safety.md) across the stack
3. Set up your [Development Workflow](development-workflow.md)
4. Prepare for [Deployment](deployment.md)

---

*Last Updated: 2025-01-03*