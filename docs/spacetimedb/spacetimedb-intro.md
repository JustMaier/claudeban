# SpacetimeDB Introduction

A quick introduction to SpacetimeDB concepts for developers new to the platform.

## What is SpacetimeDB?

SpacetimeDB is a **database with superpowers**:
- Runs your backend logic inside the database
- Real-time subscriptions built-in
- Direct client connections (no API server)
- Scales to millions of concurrent users

Think of it as **PostgreSQL + Redis + WebSockets + Your Backend** all in one.

## Core Concepts

### 1. Tables
Just like any database, but with extras:
```csharp
[Table(Name = "card", Public = true)]
public partial struct Card {
    [PrimaryKey, AutoInc] public ulong CardId;
    public string Title;
    public Identity Assignee;  // Built-in user identity
    public Timestamp CreatedAt; // Built-in timestamp
}
```

### 2. Reducers
Your backend logic that runs inside the database:
```csharp
[Reducer]
public static void AddCard(ReducerContext ctx, string title) {
    // ctx.Sender = who called this
    // ctx.Db = database access
    // ctx.Timestamp = when called
    
    ctx.Db.card.Insert(new Card {
        Title = title,
        Assignee = ctx.Sender,
        CreatedAt = ctx.Timestamp
    });
}
```

**Key Points**:
- Reducers are the ONLY way to modify data
- They run atomically (like transactions)
- Include built-in auth via `ctx.Sender`

### 3. Subscriptions
Clients subscribe to data and get real-time updates:
```typescript
// Client subscribes to cards for a board
conn.subscriptionBuilder()
  .onApplied(() => {
    // Initial data received
    const cards = conn.db.card.iter();
  })
  .onUpdate((ctx) => {
    // Real-time updates
    const newCard = ctx.event.data;
  })
  .subscribe(`
    SELECT * FROM card WHERE boardId = ${boardId}
  `);
```

### 4. Identity System
Every client gets a unique identity:
- Assigned on first connection
- Persists across sessions
- Used for auth in reducers
- No passwords needed (but can add them)

## Why It's Different

### Traditional Stack
```
Browser → API Server → Database
         ↓
    WebSocket Server → Redis
```

### SpacetimeDB Stack
```
Browser → SpacetimeDB
```

**Benefits**:
- No API endpoints to write
- No WebSocket code
- No cache invalidation
- Automatic real-time sync
- Less code, fewer bugs

## Real-World Example

### Traditional Approach (100+ lines):
```javascript
// API endpoint
app.post('/api/cards', async (req, res) => {
  const card = await db.cards.create(req.body);
  await redis.publish('card-created', card);
  res.json(card);
});

// WebSocket handler
io.on('connection', (socket) => {
  socket.join(`board-${boardId}`);
  redis.subscribe('card-created', (card) => {
    socket.to(`board-${boardId}`).emit('card', card);
  });
});

// Client
fetch('/api/cards', { method: 'POST', body });
socket.on('card', updateUI);
```

### SpacetimeDB Approach (10 lines):
```csharp
// Server
[Reducer]
public static void AddCard(ReducerContext ctx, string title) {
    ctx.Db.card.Insert(new Card { Title = title });
}
```

```typescript
// Client
conn.reducers.addCard(title);
// UI updates automatically via subscription!
```

## Performance & Scale

- **Blazing Fast**: In-memory with persistence
- **Horizontally Scalable**: Add more nodes as needed
- **Physics-Ready**: Can handle 60fps updates for games
- **Built for Multiplayer**: Thousands of concurrent users per "room"

## Security Model

### Row-Level Security
Control who sees what:
```csharp
// Only return boards where user is a collaborator
var myBoards = ctx.Db.board.Iter()
    .Where(b => ctx.Db.collaborator.Iter()
        .Any(c => c.BoardId == b.BoardId && 
                  c.Identity == ctx.Sender));
```

### Reducer Validation
Every reducer knows who's calling:
```csharp
[Reducer]
public static void DeleteCard(ReducerContext ctx, ulong cardId) {
    var card = ctx.Db.card.CardId.Find(cardId);
    
    // Only owner can delete
    if (card.Assignee != ctx.Sender) {
        throw new Exception("Not authorized");
    }
    
    ctx.Db.card.CardId.Delete(card);
}
```

## When to Use SpacetimeDB

**Perfect For**:
- Real-time collaborative apps
- Multiplayer games
- Live dashboards
- Chat applications
- Collaborative editing

**Consider Alternatives If**:
- You need complex SQL queries
- Heavy analytics workloads
- Existing system integration
- Regulatory requirements for specific databases

## Learn More

- [Official Docs](https://docs.spacetimedb.com)
- [Discord Community](https://discord.gg/spacetimedb)
- [Example Projects](https://github.com/clockworklabs/spacetimedb-examples)
- [Architecture Deep Dive](architecture.md)

## Quick Takeaways

1. **It's a database** - stores your data persistently
2. **It runs your code** - reducers are your backend
3. **It syncs automatically** - subscriptions handle real-time
4. **It scales** - built for multiplayer from day one
5. **It's simple** - way less code than traditional stacks