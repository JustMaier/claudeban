# SpacetimeDB Architecture Deep Dive

SpacetimeDB represents a fundamental shift in how we build distributed applications by merging the database and server into a single programmable unit. This document explores its architecture through the lens of our Kanban application.

## The Problem: Traditional Architecture Complexity

In traditional web applications, you typically have:
- A database (PostgreSQL, MySQL, etc.)
- A backend API server (Node.js, Django, etc.)
- WebSocket servers for real-time features
- Cache layers (Redis)
- Message queues for background jobs
- Separate authentication services

Each layer adds complexity, latency, and potential failure points. Real-time features are particularly challenging, requiring careful synchronization between the database state and connected clients.

## SpacetimeDB's Solution: The Database IS the Server

SpacetimeDB collapses this entire stack into a single entity. Your C# code compiles to WebAssembly and runs inside the database itself. Let's see how this works in practice.

### WebAssembly Module System

Our Kanban server is a C# project that compiles to WebAssembly:

```csharp
// Module.cs
using SpacetimeDB;

public static partial class Module
{
    [Reducer(ReducerKind.Init)]
    public static void Init(ReducerContext ctx)
    {
        Log.Info("DB initialised");
    }
}
```

The `Module` class is special - it's the entry point for your SpacetimeDB module. Methods marked with `[Reducer]` become the API endpoints that clients can call. The module compiles to a `.wasm` file that SpacetimeDB loads and executes.

### Tables: More Than Just Data Storage

Tables in SpacetimeDB are C# structs with attributes that define their database behavior:

```csharp
// domains/Users.cs
[Table(Name = "user", Public = true)]
public partial struct User
{
    [PrimaryKey] public Identity Id;
    public string? Name;
    public bool Online;
}
```

Key architectural insights:

1. **Type Safety**: Tables are strongly typed C# structs, not SQL strings
2. **Public vs Private**: The `Public = true` attribute makes tables visible to clients
3. **Identity Type**: SpacetimeDB provides a built-in `Identity` type for user identification
4. **Automatic Serialization**: The SDK handles all serialization/deserialization

### Reducers: The API Layer Inside the Database

Reducers are methods that can modify database state. They're like stored procedures on steroids:

```csharp
// domains/Cards.cs
[Reducer]
public static void AddCard(ReducerContext ctx, ulong boardId, string title)
{
    var board = ctx.Db.board.BoardId.Find(boardId) ??
        throw new Exception("board not found");
    
    // Check authorization
    if (!ctx.Db.collaborator.Iter().Any(c => c.BoardId == boardId && c.Identity == ctx.Sender))
        throw new Exception("not allowed");

    ctx.Db.card.Insert(new Card {
        BoardId = boardId,
        Title   = title,
        State   = "todo",
        Assignee = ctx.Sender,
        CreatedAt = ctx.Timestamp
    });
}
```

The `ReducerContext` provides:
- `ctx.Db`: Direct access to all tables
- `ctx.Sender`: The identity of the caller
- `ctx.Timestamp`: Server-side timestamp for consistency
- `ctx.Address`: Connection details including `ConnectionId`

### Real-Time Subscriptions: Built Into the Core

Unlike traditional databases where you poll for changes, SpacetimeDB pushes updates to clients automatically. Here's how the client subscribes:

```typescript
// client/src/lib/stores/board-store.svelte.ts
subscription = conn.subscriptionBuilder()
  .onApplied(() => {
    // Initial data loaded
    for (const board of conn.db.board.iter()) {
      boardMap.set(board.boardId, board);
    }
    
    // Set up real-time listeners
    conn.db.board.onInsert((ctx, board) => {
      boardMap.set(board.boardId, board);
    });

    conn.db.board.onUpdate((_ctx, _old, board) => {
      boardMap.set(board.boardId, board);
    });

    conn.db.board.onDelete((_ctx, board) => {
      boardMap.delete(board.boardId);
    });
  })
  .subscribe(['SELECT * FROM board']);
```

The architecture here is profound:
1. **SQL-based Subscriptions**: Clients subscribe using SQL queries
2. **Automatic Change Detection**: The database tracks which rows each client can see
3. **Incremental Updates**: Only changes are sent, not full datasets
4. **Type-Safe Events**: Insert/update/delete events are strongly typed

### Row-Level Security: Declarative and Efficient

SpacetimeDB implements row-level security through visibility filters:

```csharp
// domains/Boards.cs
#pragma warning disable STDB_UNSTABLE
[ClientVisibilityFilter]
public static readonly Filter BOARD_VIS =
    new Filter.Sql(@"
        SELECT board.* FROM board
        INNER JOIN collaborator ON board.BoardId = collaborator.BoardId
        WHERE collaborator.Identity = :sender
    ");
#pragma warning restore STDB_UNSTABLE
```

This filter ensures users only see boards they collaborate on. The database automatically:
1. Applies filters to all queries from that client
2. Filters real-time updates to only send allowed changes
3. Maintains separate visibility per connection

### Identity and Authentication: Built-In

SpacetimeDB provides identity management out of the box:

```csharp
// domains/Users.cs
[Reducer(ReducerKind.ClientConnected)]
public static void ClientConnect(ReducerContext ctx)
{
    var u = ctx.Db.user.Id.Find(ctx.Sender);
    if (u is null)
        ctx.Db.user.Insert(new User { Id = ctx.Sender, Online = true });
    else {
        var updatedUser = u.Value;
        updatedUser.Online = true;
        ctx.Db.user.Id.Update(updatedUser);
    }
}
```

The client connection is equally simple:

```typescript
// client/src/lib/spacetime.ts
export function connectDb(connectedCb: (conn: DbConnection, id: Identity, tok: string) => void): DbConnection {
  return DbConnection.builder()
    .withUri('ws://localhost:3000')
    .withModuleName('kanban-plus')
    .withToken(localStorage.getItem('auth') ?? '')
    .onConnect((conn: DbConnection, id: Identity, tok: string) => {
      localStorage.setItem('auth', tok);
      connectedCb(conn, id, tok);
    })
    .build();
}
```

Each connection gets:
- A unique `Identity` that persists across sessions
- An auth token for reconnection
- Automatic session management

### Scheduled Tasks: Database-Native Cron

Background jobs run inside the database:

```csharp
// domains/Metrics.cs
[Table(Name = "metric_timer",
       Scheduled = nameof(RollupMetrics),
       ScheduledAt = nameof(ScheduledAt))]
public partial struct MetricTimer
{
    [PrimaryKey, AutoInc] public ulong TimerId;
    public ScheduleAt ScheduledAt;
}

[Reducer]
public static void RollupMetrics(ReducerContext ctx, MetricTimer timerId)
{
    // This runs on schedule, inside the database
    uint done = 0;
    foreach (var card in ctx.Db.card.Iter())
    {
        if (card.State == "done") done++;
    }
    
    ctx.Db.metric.Insert(new Metric { Day = today, CardsCompleted = done });
}
```

No external cron jobs or task queues needed - the database handles scheduling internally.

### Multi-Tab and Presence Awareness

The architecture elegantly handles multiple connections per user:

```csharp
// domains/BoardViewers.cs
[Table(Name = "board_viewer", Public = true)]
[SpacetimeDB.Index.BTree(Name = "UserConnections", Columns = [nameof(Identity), nameof(ConnectionId)])]
public partial struct BoardViewer
{
    public ulong BoardId;
    public Identity Identity;
    public string ConnectionId;  // Handle multiple tabs
    public Timestamp LastPing;
}

[Reducer]
public static void StartViewingBoard(ReducerContext ctx, ulong boardId)
{
    // Track this specific connection viewing this board
    ctx.Db.board_viewer.Insert(new BoardViewer {
        BoardId = boardId,
        Identity = ctx.Sender,
        ConnectionId = ctx.Address.ConnectionId.ToString(),
        LastPing = ctx.Timestamp
    });
}
```

Each browser tab gets its own `ConnectionId`, allowing precise presence tracking.

## Architectural Benefits

### 1. **Zero Network Latency for Logic**
All business logic executes inside the database. There's no round-trip between app server and database.

### 2. **Automatic Consistency**
Since all state changes happen through reducers in a single system, race conditions and consistency issues largely disappear.

### 3. **Built-in Real-time**
Every table change automatically propagates to subscribed clients. No need for separate WebSocket servers or pub/sub systems.

### 4. **Simplified Deployment**
Deploy one WebAssembly module instead of coordinating database migrations, API deployments, and cache invalidation.

### 5. **Time-Travel Debugging**
SpacetimeDB can replay the entire history of reducer calls, making debugging distributed systems tractable.

## Trade-offs and Considerations

### 1. **Language Constraints**
You must use a language that compiles to WebAssembly (C#, Rust, etc.). The module runs in a sandboxed environment with limited system access.

### 2. **Compute Limitations**
Complex computations in reducers block other operations. CPU-intensive work may need to be offloaded.

### 3. **Database Lock-in**
Your application is tightly coupled to SpacetimeDB's execution model. Migrating to a traditional architecture would require significant refactoring.

### 4. **Debugging Complexity**
While time-travel debugging helps, the merged database/server model can make some issues harder to diagnose.

## Conclusion

SpacetimeDB's architecture represents a radical simplification of the web application stack. By running application logic inside the database and providing real-time subscriptions as a primitive, it eliminates entire categories of complexity.

Our Kanban application demonstrates this elegance: row-level security, real-time updates, presence tracking, and scheduled tasks all work seamlessly without external services. The result is a more maintainable, performant, and consistent application with significantly less infrastructure to manage.

The key insight is that most web applications are fundamentally about managing state and notifying clients of changes. SpacetimeDB makes this the core primitive, building everything else around it. This inversion of the traditional architecture may well represent the future of distributed application development.