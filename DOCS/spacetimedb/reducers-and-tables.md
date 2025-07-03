# Reducers and Tables: SpacetimeDB Programming Model

SpacetimeDB follows a unique programming model that combines database tables with transactional reducers. This guide explores the core concepts, patterns, and best practices through our Kanban-Plus implementation.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Table Design Patterns](#table-design-patterns)
3. [Reducer Patterns](#reducer-patterns)
4. [Authorization and Security](#authorization-and-security)
5. [Transaction Guarantees](#transaction-guarantees)
6. [Table Relationships](#table-relationships)
7. [Advanced Patterns](#advanced-patterns)
8. [Best Practices and Anti-Patterns](#best-practices-and-anti-patterns)

## Core Concepts

SpacetimeDB modules define two primary components:

1. **Tables**: Persistent data structures with schema and indexes
2. **Reducers**: Transactional functions that modify the database state

### The Partial Class Pattern

All tables and reducers are defined within a partial class called `Module`:

```csharp
public static partial class Module
{
    // Tables and reducers defined here
}
```

This allows SpacetimeDB to split table definitions and business logic across multiple files while maintaining a single module interface.

## Table Design Patterns

### Basic Table Definition

Tables are defined as structs with the `[Table]` attribute:

```csharp
[Table(Name = "user", Public = true)]
public partial struct User
{
    [PrimaryKey] public Identity Id;
    public string? Name;
    public bool Online;
}
```

Key characteristics:
- **Structs over Classes**: Tables must be value types (structs)
- **Partial Structs**: Allows SpacetimeDB to generate additional methods
- **Public Flag**: Controls client visibility of table data

### Primary Keys and Auto-Increment

SpacetimeDB supports different primary key strategies:

```csharp
// Identity-based primary key (for user tables)
[Table(Name = "user", Public = true)]
public partial struct User
{
    [PrimaryKey] public Identity Id;
    // ...
}

// Auto-incrementing primary key
[Table(Name = "board", Public = true)]
public partial struct Board
{
    [PrimaryKey, AutoInc] public ulong BoardId;
    // ...
}
```

### Unique Constraints

Enforce uniqueness on non-primary key columns:

```csharp
[Table(Name = "board", Public = true)]
public partial struct Board
{
    [PrimaryKey, AutoInc] public ulong BoardId;
    [Unique] public string Slug;  // Ensures no duplicate slugs
    public string Title;
    // ...
}
```

### Indexes for Performance

Create indexes for efficient queries:

```csharp
[Table(Name = "collaborator", Public = true)]
[SpacetimeDB.Index.BTree(Name = "BoardIdentity", Columns = [nameof(BoardId), nameof(Identity)])]
public partial struct Collaborator
{
    public ulong BoardId;
    public Identity Identity;
}
```

This creates a composite index on `(BoardId, Identity)` for fast lookups of board collaborators.

### Timestamps and Nullable Types

SpacetimeDB provides built-in timestamp support:

```csharp
[Table(Name = "card", Public = true)]
public partial struct Card
{
    [PrimaryKey, AutoInc] public ulong CardId;
    public Timestamp CreatedAt;
    public Timestamp? CompletedAt;  // Nullable for optional timestamps
}
```

## Reducer Patterns

Reducers are the only way to modify database state in SpacetimeDB. They execute transactionally and atomically.

### Basic Reducer Structure

```csharp
[Reducer]
public static void CreateBoard(ReducerContext ctx, string slug, string title)
{
    slug = slug.Trim().ToLowerInvariant();
    if (ctx.Db.board.Slug.Find(slug) is not null)
        throw new Exception("slug already used");

    var board = ctx.Db.board.Insert(new Board {
        Slug = slug,
        Title = title,
        Owner = ctx.Sender,
        CreatedAt = ctx.Timestamp
    });

    ctx.Db.collaborator.Insert(new Collaborator {
        BoardId = board.BoardId,
        Identity = ctx.Sender
    });
}
```

Key components:
- **ReducerContext**: Provides database access, sender identity, and timestamp
- **Atomic Execution**: All operations succeed or fail together
- **Validation**: Check constraints before modifying data

### System Reducers

SpacetimeDB provides special reducer types for lifecycle events:

```csharp
[Reducer(ReducerKind.Init)]
public static void Init(ReducerContext ctx)
{
    Log.Info("DB initialised");
}

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

[Reducer(ReducerKind.ClientDisconnected)]
public static void ClientDisconnect(ReducerContext ctx)
{
    var u = ctx.Db.user.Id.Find(ctx.Sender);
    if (u is not null) {
        var updatedUser = u.Value;
        updatedUser.Online = false;
        ctx.Db.user.Id.Update(updatedUser);
    }
}
```

### Update Patterns

SpacetimeDB requires finding and updating records explicitly:

```csharp
[Reducer]
public static void CompleteCard(ReducerContext ctx, ulong cardId)
{
    // Find the record
    var c = ctx.Db.card.CardId.Find(cardId) ??
        throw new Exception("no card");

    // Verify authorization
    if (c.Assignee != ctx.Sender) 
        throw new Exception("not your card");

    // Modify the struct
    c.State = "done";
    c.CompletedAt = ctx.Timestamp;
    
    // Update in database
    ctx.Db.card.CardId.Update(c);
}
```

### Multi-Table Transactions

Reducers can modify multiple tables atomically:

```csharp
[Reducer]
public static void StartViewingBoard(ReducerContext ctx, ulong boardId)
{
    // Validate authorization
    var isCollaborator = ctx.Db.collaborator.BoardIdentity
        .Filter((boardId, ctx.Sender)).Any();
    
    if (!isCollaborator)
        throw new Exception("Not authorized to view this board");
    
    // Remove existing viewer entries
    var existingViewers = ctx.Db.board_viewer.UserConnections
        .Filter((ctx.Sender, ctx.CallerAddress.ToString()))
        .ToList();
    
    foreach (var viewer in existingViewers)
    {
        ctx.Db.board_viewer.Delete(viewer);
    }
    
    // Add new viewer entry
    ctx.Db.board_viewer.Insert(new BoardViewer {
        BoardId = boardId,
        Identity = ctx.Sender,
        ConnectionId = ctx.CallerAddress.ToString(),
        LastPing = ctx.Timestamp,
        UserAgent = null
    });
}
```

## Authorization and Security

### Row-Level Security with Visibility Filters

SpacetimeDB supports row-level security through visibility filters:

```csharp
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

This ensures users only see boards they collaborate on.

### Authorization in Reducers

Always validate permissions in reducers:

```csharp
[Reducer]
public static void AddCard(ReducerContext ctx, ulong boardId, string title)
{
    // Check board exists
    var board = ctx.Db.board.BoardId.Find(boardId) ??
        throw new Exception("board not found");
    
    // Verify user is collaborator
    if (!ctx.Db.collaborator.Iter().Any(c => c.BoardId == boardId && c.Identity == ctx.Sender))
        throw new Exception("not allowed");

    // Safe to proceed
    ctx.Db.card.Insert(new Card {
        BoardId = boardId,
        Title = title,
        State = "todo",
        Assignee = ctx.Sender,
        CreatedAt = ctx.Timestamp
    });
}
```

### Multi-Level Authorization

For operations affecting multiple users:

```csharp
[Reducer]
public static void ReassignCard(ReducerContext ctx, ulong cardId, Identity newAssignee)
{
    var c = ctx.Db.card.CardId.Find(cardId) ??
        throw new Exception("no card");

    // Check sender is collaborator
    if (!ctx.Db.collaborator.Iter().Any(col => col.BoardId == c.BoardId && col.Identity == ctx.Sender))
        throw new Exception("not a collaborator on this board");

    // Check new assignee is also collaborator
    if (!ctx.Db.collaborator.Iter().Any(col => col.BoardId == c.BoardId && col.Identity == newAssignee))
        throw new Exception("new assignee is not a collaborator on this board");

    c.Assignee = newAssignee;
    ctx.Db.card.CardId.Update(c);
}
```

## Transaction Guarantees

SpacetimeDB provides strong ACID guarantees:

### Atomicity

All operations in a reducer execute atomically:

```csharp
[Reducer]
public static void CreateBoard(ReducerContext ctx, string slug, string title)
{
    // These operations are atomic - both succeed or both fail
    var board = ctx.Db.board.Insert(new Board {
        Slug = slug,
        Title = title,
        Owner = ctx.Sender,
        CreatedAt = ctx.Timestamp
    });

    ctx.Db.collaborator.Insert(new Collaborator {
        BoardId = board.BoardId,
        Identity = ctx.Sender
    });
}
```

### Consistency

Validation ensures data consistency:

```csharp
[Reducer]
public static void UpdateCardStatus(ReducerContext ctx, ulong cardId, string newStatus)
{
    var c = ctx.Db.card.CardId.Find(cardId) ??
        throw new Exception("no card");

    // Validate status values
    if (newStatus != "todo" && newStatus != "in_progress" && newStatus != "done")
        throw new Exception("invalid status");

    c.State = newStatus;
    
    // Maintain consistency between state and CompletedAt
    if (newStatus == "done")
    {
        c.CompletedAt = ctx.Timestamp;
    }
    else
    {
        c.CompletedAt = null;
    }
    
    ctx.Db.card.CardId.Update(c);
}
```

### Isolation

Each reducer execution is isolated from concurrent modifications.

### Durability

All committed changes are persisted to disk before the reducer returns.

## Table Relationships

### One-to-Many Relationships

Board to Cards relationship:

```csharp
// Parent table
[Table(Name = "board", Public = true)]
public partial struct Board
{
    [PrimaryKey, AutoInc] public ulong BoardId;
    // ...
}

// Child table with foreign key
[Table(Name = "card", Public = true)]
public partial struct Card
{
    [PrimaryKey, AutoInc] public ulong CardId;
    public ulong BoardId;  // Foreign key to board
    // ...
}
```

### Many-to-Many Relationships

Users and Boards through Collaborator junction table:

```csharp
[Table(Name = "collaborator", Public = true)]
[SpacetimeDB.Index.BTree(Name = "BoardIdentity", Columns = [nameof(BoardId), nameof(Identity)])]
public partial struct Collaborator
{
    public ulong BoardId;     // FK to Board
    public Identity Identity;  // FK to User
}
```

### Querying Relationships

Use indexes for efficient relationship queries:

```csharp
// Find all collaborators for a board
var collaborators = ctx.Db.collaborator.BoardIdentity
    .Filter((boardId, ctx.Sender));

// Check if user is collaborator
var isCollaborator = ctx.Db.collaborator.BoardIdentity
    .Filter((boardId, ctx.Sender)).Any();
```

## Advanced Patterns

### Scheduled Tasks

SpacetimeDB supports scheduled reducers:

```csharp
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
    var today = "2024-01-01";
    uint done = 0;

    foreach (var card in ctx.Db.card.Iter())
    {
        if (card.State == "done")
        {
            done++;
        }
    }

    try {
        ctx.Db.metric.Insert(new Metric { Day = today, CardsCompleted = done });
    } catch {
        // Handle duplicate key
    }

    Log.Info($"Metrics rollup completed: {done} cards done today");
}
```

### Connection Tracking

Track multiple connections per user:

```csharp
[Table(Name = "board_viewer", Public = true)]
[SpacetimeDB.Index.BTree(Name = "UserConnections", Columns = [nameof(Identity), nameof(ConnectionId)])]
public partial struct BoardViewer
{
    public ulong BoardId;
    public Identity Identity;
    public string ConnectionId;  // Handle multiple tabs
    public Timestamp LastPing;
    public string? UserAgent;
}
```

### Cleanup on Disconnect

Clean up ephemeral data when clients disconnect:

```csharp
[Reducer(ReducerKind.ClientDisconnected)]
public static void ClientDisconnect(ReducerContext ctx)
{
    // Update user status
    var u = ctx.Db.user.Id.Find(ctx.Sender);
    if (u is not null) {
        var updatedUser = u.Value;
        updatedUser.Online = false;
        ctx.Db.user.Id.Update(updatedUser);
    }

    // Clean up viewer entries
    var viewers = ctx.Db.board_viewer.UserConnections
        .Filter((ctx.Sender, ctx.CallerAddress.ToString()))
        .ToList();

    foreach (var viewer in viewers)
        ctx.Db.board_viewer.Delete(viewer);
}
```

### Optimistic Locking Pattern

For high-contention scenarios:

```csharp
[Table(Name = "counter", Public = true)]
public partial struct Counter
{
    [PrimaryKey] public string Id;
    public long Value;
    public ulong Version;
}

[Reducer]
public static void IncrementCounter(ReducerContext ctx, string id, ulong expectedVersion)
{
    var counter = ctx.Db.counter.Id.Find(id) ??
        throw new Exception("counter not found");
    
    if (counter.Version != expectedVersion)
        throw new Exception("version mismatch - retry required");
    
    counter.Value++;
    counter.Version++;
    ctx.Db.counter.Id.Update(counter);
}
```

## Best Practices and Anti-Patterns

### Best Practices

1. **Validate Early**: Check all preconditions at the start of reducers
   ```csharp
   [Reducer]
   public static void UpdateCard(ReducerContext ctx, ulong cardId, string title)
   {
       // Validate inputs first
       if (string.IsNullOrWhiteSpace(title))
           throw new Exception("Title cannot be empty");
       
       // Then check existence
       var card = ctx.Db.card.CardId.Find(cardId) ??
           throw new Exception("Card not found");
       
       // Then check authorization
       if (!IsAuthorized(ctx, card.BoardId))
           throw new Exception("Not authorized");
       
       // Finally perform update
       card.Title = title;
       ctx.Db.card.CardId.Update(card);
   }
   ```

2. **Use Indexes Wisely**: Create indexes for common query patterns
   ```csharp
   // Good: Index for common filter operations
   [SpacetimeDB.Index.BTree(Name = "BoardCards", Columns = [nameof(BoardId)])]
   ```

3. **Keep Reducers Focused**: One reducer should do one thing well
   ```csharp
   // Good: Separate reducers for different operations
   [Reducer] public static void CreateCard(...) { }
   [Reducer] public static void UpdateCardTitle(...) { }
   [Reducer] public static void UpdateCardStatus(...) { }
   ```

4. **Use Meaningful Exceptions**: Provide clear error messages
   ```csharp
   // Good
   throw new Exception($"Board {boardId} not found");
   
   // Bad
   throw new Exception("error");
   ```

5. **Handle Edge Cases**: Consider nullable fields and empty collections
   ```csharp
   // Handle nullable timestamp
   if (card.CompletedAt.HasValue)
   {
       var duration = ctx.Timestamp - card.CompletedAt.Value;
       // ...
   }
   ```

### Anti-Patterns to Avoid

1. **Don't Skip Authorization**: Never assume the sender is authorized
   ```csharp
   // Bad: No authorization check
   [Reducer]
   public static void DeleteBoard(ReducerContext ctx, ulong boardId)
   {
       var board = ctx.Db.board.BoardId.Find(boardId);
       ctx.Db.board.Delete(board.Value);  // Dangerous!
   }
   ```

2. **Don't Use Mutable State**: Reducers should be pure functions
   ```csharp
   // Bad: Using static mutable state
   private static int counter = 0;
   
   [Reducer]
   public static void IncrementCounter(ReducerContext ctx)
   {
       counter++;  // Don't do this!
   }
   ```

3. **Don't Ignore Transaction Boundaries**: Keep related operations together
   ```csharp
   // Bad: Splitting atomic operations
   [Reducer]
   public static void StartCreateBoard(ReducerContext ctx, string slug)
   {
       ctx.Db.board.Insert(new Board { Slug = slug });
   }
   
   [Reducer]
   public static void FinishCreateBoard(ReducerContext ctx, string slug)
   {
       // This might fail, leaving orphaned board!
       var board = ctx.Db.board.Slug.Find(slug);
       ctx.Db.collaborator.Insert(...);
   }
   ```

4. **Don't Over-Index**: Indexes have storage and write costs
   ```csharp
   // Bad: Too many indexes on rarely-queried columns
   [Index.BTree(Columns = [nameof(Field1)])]
   [Index.BTree(Columns = [nameof(Field2)])]
   [Index.BTree(Columns = [nameof(Field3)])]
   [Index.BTree(Columns = [nameof(Field4)])]
   ```

5. **Don't Use Complex Visibility Filters**: Keep filters simple and performant
   ```csharp
   // Bad: Overly complex visibility filter
   [ClientVisibilityFilter]
   public static readonly Filter COMPLEX_VIS =
       new Filter.Sql(@"
           SELECT * FROM table1 t1
           JOIN table2 t2 ON ...
           JOIN table3 t3 ON ...
           WHERE EXISTS (SELECT 1 FROM ...)
           AND NOT EXISTS (SELECT 1 FROM ...)
       ");
   ```

## Summary

SpacetimeDB's programming model combines the simplicity of structs with the power of transactional reducers. By following these patterns:

- Define clear table schemas with appropriate indexes
- Write focused, well-validated reducers
- Implement proper authorization at every level
- Leverage transaction guarantees for data consistency
- Use advanced features like scheduled tasks judiciously

You can build robust, real-time collaborative applications that scale with your users' needs.