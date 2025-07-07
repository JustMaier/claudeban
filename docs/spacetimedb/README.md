# SpacetimeDB Documentation

SpacetimeDB is a real-time relational database designed for multiplayer applications and collaborative software. This section covers everything you need to know about using SpacetimeDB in your projects.

## 🎯 What is SpacetimeDB?

SpacetimeDB combines:
- **Relational database** with SQL-like tables
- **Real-time subscriptions** for live data updates  
- **Server-side logic** via reducers (like stored procedures)
- **Row-level security** for multi-tenant applications
- **WebAssembly modules** for custom business logic

## 📚 Documentation

### Getting Started
- [Getting Started Guide](getting-started.md) - Installation, setup, and your first module
- [Architecture Overview](architecture.md) - How SpacetimeDB works under the hood

### Core Concepts
- [Reducers and Tables](reducers-and-tables.md) - The programming model explained
- [Client SDK Guide](client-sdk.md) - Using the TypeScript SDK effectively

### Troubleshooting & Best Practices
- [Debugging Guide](debugging.md) - Common issues and solutions
- [Best Practices](best-practices.md) - Patterns for production applications

## 🚀 Quick Example

Here's a taste of SpacetimeDB from our Kanban application:

**Server-side reducer** (`server/domains/Cards.cs:25`):
```csharp
[SpacetimeDB.Reducer]
public static void AddCard(ReducerContext ctx, ulong boardId, string title)
{
    var board = Board.FilterByBoardId(boardId).First();
    if (board.Owner != ctx.Sender)
    {
        throw new Exception("Only board owner can add cards");
    }
    
    new Card
    {
        CardId = Card.Count() + 1,
        BoardId = boardId,
        Title = title,
        State = CardState.Todo,
        CreatedBy = ctx.Sender,
        CreatedAt = ctx.Timestamp
    }.Insert();
}
```

**Client-side subscription** (`client/src/lib/spacetime.ts:45`):
```typescript
// Subscribe to all cards for a board
const cards = Card.filterByBoardId(boardId);
cards.subscribe((cards) => {
    console.log("Cards updated:", cards);
});

// Add a new card
AddCardReducer.call(boardId, "New Task");
```

## 🔧 Current Implementation

Our Kanban application demonstrates:

### Tables
- `User` - User accounts and presence
- `Board` - Kanban boards with ownership
- `Card` - Tasks with state tracking
- `Collaborator` - Board sharing
- `Metric` & `MetricTimer` - Usage analytics

### Reducers  
- User management: `SetUserName`, `ClientConnect`, `ClientDisconnect`
- Board operations: `CreateBoard`, `AddCollaborator`
- Card workflows: `AddCard`, `CompleteCard`, `UpdateCardStatus`, `ReassignCard`
- Analytics: `RollupMetrics` (scheduled)

## ⚡ Key Features We Use

1. **Real-time Sync**: Changes propagate instantly to all connected clients
2. **Row-Level Security**: Users only see boards they own or collaborate on
3. **Optimistic Updates**: UI updates immediately while server confirms
4. **Presence System**: See who's online in real-time
5. **Scheduled Tasks**: Nightly metric rollups

## 🐛 Known Issues

From our experience (`DEBUG/logs/no-data.md`):

1. **State mutation errors** in Svelte when updating during subscriptions
2. **WebSocket reconnection** needs manual handling
3. **Identity initialization** timing can be tricky

See [Debugging Guide](debugging.md) for solutions.

## 📊 Performance Characteristics

- **Latency**: ~5-10ms for local operations
- **Throughput**: Handles 1000s of concurrent connections
- **Storage**: Efficient binary format, ~10% of JSON size
- **Memory**: Each connection ~100KB overhead

## 🔗 Resources

- [Official SpacetimeDB Docs](https://spacetimedb.com/docs)
- [GitHub Repository](https://github.com/clockworklabs/SpacetimeDB)
- [Discord Community](https://discord.gg/spacetimedb)

## 🎯 Next Steps

1. Follow the [Getting Started Guide](getting-started.md)
2. Understand the [Architecture](architecture.md)
3. Learn about [Reducers and Tables](reducers-and-tables.md)
4. Explore our [Kanban Implementation](../case-studies/kanban-implementation.md)

---

*Last Updated: 2025-01-03*