# Building a Real-Time Kanban Board with SpacetimeDB: A Case Study

## Executive Summary

This case study documents the journey of building a feature-rich Kanban board application using SpacetimeDB, demonstrating how a modern real-time collaborative application can be built with minimal infrastructure complexity. The project evolved from a basic CRUD application to a sophisticated real-time collaboration platform with presence awareness, activity tracking, and performance optimizations.

## Table of Contents

1. [Project Goals and Requirements](#project-goals-and-requirements)
2. [Architecture Decisions](#architecture-decisions)
3. [Implementation Phases](#implementation-phases)
4. [Key Features Developed](#key-features-developed)
5. [Challenges and Solutions](#challenges-and-solutions)
6. [Performance Optimizations](#performance-optimizations)
7. [Lessons Learned](#lessons-learned)
8. [Future Enhancements](#future-enhancements)

## Project Goals and Requirements

### Initial Requirements
- **Multi-board support**: Users can create and manage multiple Kanban boards
- **Real-time synchronization**: Changes appear instantly across all connected clients
- **Collaborative features**: Multiple users can work on the same board simultaneously
- **Task management**: Create, update, and complete cards with status tracking
- **User presence**: See who's currently viewing each board
- **Activity tracking**: Monitor board and card activity

### Technical Constraints
- Use SpacetimeDB as the sole backend infrastructure
- Implement using C# for server modules and TypeScript/Svelte 5 for the client
- Demonstrate all major SpacetimeDB features
- Build for local development with potential for production deployment

## Architecture Decisions

### Backend Architecture

The server module was structured using a domain-driven approach with separate files for different concerns:

```csharp
server/
   Module.cs           // Main module entry point
   domains/
      Boards.cs      // Board and collaborator management
      Cards.cs       // Card lifecycle and operations
      Users.cs       // User management and authentication
      BoardViewers.cs // Real-time presence tracking
      Metrics.cs     // Analytics and metrics rollup
```

This separation allowed for better code organization and made it easier to implement row-level security (RLS) filters for each domain.

### Data Model Evolution

#### Phase 1: Basic Structure
```csharp
[Table(Name = "board", Public = true)]
public partial struct Board
{
    [PrimaryKey, AutoInc] public ulong BoardId;
    [Unique] public string Slug;
    public string Title;
    public Identity Owner;
    public Timestamp CreatedAt;
}
```

#### Phase 2: Enhanced with Collaboration
```csharp
[Table(Name = "collaborator", Public = true)]
[SpacetimeDB.Index.BTree(Name = "BoardIdentity", Columns = [nameof(BoardId), nameof(Identity)])]
public partial struct Collaborator
{
    public ulong BoardId;
    public Identity Identity;
}
```

#### Phase 3: Real-time Presence
```csharp
[Table(Name = "board_viewer", Public = true)]
public partial struct BoardViewer
{
    public ulong BoardId;
    public Identity Identity;
    public string ConnectionId;  // Handle multiple tabs
    public Timestamp LastPing;
    public string? UserAgent;    // Track device type
}
```

### Client Architecture

The client evolved from a simple store-based architecture to a sophisticated reactive system using Svelte 5's new runes:

```typescript
// Initial approach (basic stores)
let boards = writable<Board[]>([]);

// Evolved approach (reactive runes with global stores)
class GlobalBoardStore {
  private boards = $state<Map<bigint, Board>>(new Map());
  private activeBoard = $state<bigint | null>(null);
  
  // Singleton pattern for global state
  private static instance: GlobalBoardStore;
  static getInstance(): GlobalBoardStore {
    if (!GlobalBoardStore.instance) {
      GlobalBoardStore.instance = new GlobalBoardStore();
    }
    return GlobalBoardStore.instance;
  }
}
```

## Implementation Phases

### Phase 1: Foundation (Initial Commit)
- Basic SpacetimeDB setup with C# server module
- Simple board and card CRUD operations
- Minimal client with TypeScript bindings

### Phase 2: Real-time Synchronization
- Implemented WebSocket connections for live updates
- Added subscription-based data flow
- Fixed initial data loading issues

**Key Learning**: The subscription model required careful initialization to avoid race conditions:

```typescript
// Problem: Listeners set up before initial data load
conn.db.board.onInsert(handler); // Would miss initial data

// Solution: Subscribe first, then set up listeners
subscription = conn.subscriptionBuilder()
  .onApplied(() => {
    // Load initial data
    for (const board of conn.db.board.iter()) {
      boardMap.set(board.boardId, board);
    }
    // Then set up listeners
    conn.db.board.onInsert(handler);
  })
  .subscribe(['SELECT * FROM board']);
```

### Phase 3: User Management and Authentication
- Added user table with identity mapping
- Implemented name setting functionality
- Created user profile component

**Challenge**: SpacetimeDB's identity system required careful handling:

```csharp
[Reducer]
public static void SetUserName(ReducerContext ctx, string name)
{
    // Find or create user - handle both cases
    var existingUser = ctx.Db.user.Id.Find(ctx.Sender);
    if (existingUser != null)
    {
        existingUser.Name = name;
        ctx.Db.user.Id.Update(existingUser);
    }
    else
    {
        ctx.Db.user.Insert(new User {
            Id = ctx.Sender,
            Name = name
        });
    }
}
```

### Phase 4: Collaboration Features
- Added collaborator management
- Implemented board-level permissions
- Created invitation system

**Security Implementation**: Row-level security using SQL filters:

```csharp
[ClientVisibilityFilter]
public static readonly Filter BOARD_VIS =
    new Filter.Sql(@"
        SELECT board.* FROM board
        INNER JOIN collaborator ON board.BoardId = collaborator.BoardId
        WHERE collaborator.Identity = :sender
    ");
```

### Phase 5: Advanced Card Management
- Card status updates (todo � in_progress � done)
- Card reassignment between users
- Completion tracking with timestamps

**Evolution of Card Operations**:

```csharp
// Initial: Simple completion
[Reducer]
public static void CompleteCard(ReducerContext ctx, ulong cardId)
{
    var c = ctx.Db.card.CardId.Find(cardId);
    c.State = "done";
    ctx.Db.card.CardId.Update(c);
}

// Enhanced: With validation and timestamps
[Reducer]
public static void UpdateCardStatus(ReducerContext ctx, ulong cardId, string newStatus)
{
    var c = ctx.Db.card.CardId.Find(cardId) ??
        throw new Exception("no card");

    // Permission check
    if (!ctx.Db.collaborator.Iter().Any(col => 
        col.BoardId == c.BoardId && col.Identity == ctx.Sender))
        throw new Exception("not a collaborator on this board");

    // Status validation
    if (newStatus != "todo" && newStatus != "in_progress" && newStatus != "done")
        throw new Exception("invalid status");

    c.State = newStatus;
    c.CompletedAt = newStatus == "done" ? ctx.Timestamp : null;
    
    ctx.Db.card.CardId.Update(c);
}
```

### Phase 6: Store Architecture Overhaul

The most significant refactoring came with the realization that Svelte 5's runes required a different approach to state management:

**Before**: Traditional Svelte stores
```typescript
export const boards = writable<Board[]>([]);
export const cards = writable<Card[]>([]);
```

**After**: Global singleton stores with runes
```typescript
class GlobalCardStore {
  private cardsByBoard = $state<Map<bigint, Card[]>>(new Map());
  private cardMap = $state<Map<bigint, Card>>(new Map());
  
  getCardsForBoard(boardId: bigint): Card[] {
    return this.cardsByBoard.get(boardId) || [];
  }
  
  async updateCardStatus(cardId: bigint, newStatus: string) {
    const { conn } = getConnection();
    await conn.reducers.updateCardStatus(cardId, newStatus);
  }
}
```

This architectural change solved several issues:
1. **Reactivity**: Svelte 5 runes work seamlessly with class properties
2. **Performance**: Reduced unnecessary re-renders
3. **Type Safety**: Better TypeScript integration
4. **Debugging**: Easier to trace state changes

## Key Features Developed

### 1. Real-time Presence System

The board viewer system tracks who's currently looking at each board:

```typescript
class BoardViewerStore {
  private viewersByBoard = $state<Map<bigint, BoardViewerData>>(new Map());
  private pingIntervals = new Map<bigint, NodeJS.Timeout>();
  
  async startViewing(boardId: bigint): Promise<() => void> {
    const { conn } = getConnection();
    await conn.reducers.startViewingBoard(boardId);
    
    // Ping every 30 seconds to maintain presence
    const interval = setInterval(() => {
      conn.reducers.pingBoardView(boardId);
    }, 30000);
    
    this.pingIntervals.set(boardId, interval);
    
    // Return cleanup function
    return () => this.stopViewing(boardId);
  }
}
```

### 2. Activity Tracking System

Comprehensive activity monitoring across boards and cards:

```typescript
interface ActivityEvent {
  id: string;
  timestamp: Date;
  type: 'board_created' | 'card_added' | 'card_updated' | 'user_joined';
  boardId?: bigint;
  cardId?: bigint;
  userId: Identity;
  userName?: string;
  details: any;
}

class ActivityStore {
  private activities = $state<ActivityEvent[]>([]);
  
  private trackReducerActivity(reducerName: string, args: any) {
    // Create activity events from reducer calls
    this.activities.push({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: this.mapReducerToActivityType(reducerName),
      ...this.extractDetailsFromArgs(reducerName, args)
    });
  }
}
```

### 3. Optimistic UI Updates

For better user experience, implemented optimistic updates with rollback:

```typescript
async updateCardStatus(cardId: bigint, newStatus: string) {
  const card = this.cardMap.get(cardId);
  if (!card) return;
  
  // Optimistic update
  const oldStatus = card.state;
  card.state = newStatus;
  this.triggerReactivity();
  
  try {
    await conn.reducers.updateCardStatus(cardId, newStatus);
  } catch (error) {
    // Rollback on failure
    card.state = oldStatus;
    this.triggerReactivity();
    throw error;
  }
}
```

## Challenges and Solutions

### Challenge 1: Connection Initialization Race Conditions

**Problem**: Multiple components trying to access the connection before it was established.

**Solution**: Implemented a connection store with initialization guarantees:

```typescript
let connectionInstance: { conn: DbConnection } | null = null;

export function initializeConnection() {
  if (connectionInstance) return connectionInstance;
  
  const conn = DbConnection.builder()
    .withUri("ws://localhost:3000/kanban-plus")
    .onConnect(() => console.log('Connected'))
    .build();
    
  connectionInstance = { conn };
  return connectionInstance;
}

export function getConnection() {
  if (!connectionInstance) {
    throw new Error('Connection not initialized');
  }
  return connectionInstance;
}
```

### Challenge 2: TypeScript Generation Issues

**Problem**: Generated types had import path issues and linting errors.

**Solution**: 
1. Modified import paths to use `.ts` extensions
2. Added ESLint disable comments to generated files
3. Created wrapper types for better ergonomics

### Challenge 3: Real-time Sync Conflicts

**Problem**: Rapid updates from multiple users caused race conditions.

**Solution**: Implemented server-side validation and atomic operations:

```csharp
[Reducer]
public static void ReassignCard(ReducerContext ctx, ulong cardId, Identity newAssignee)
{
    // Atomic read-validate-update pattern
    var c = ctx.Db.card.CardId.Find(cardId) ??
        throw new Exception("no card");
        
    // Validate permissions for both users
    var collaborators = ctx.Db.collaborator.Iter()
        .Where(col => col.BoardId == c.BoardId)
        .Select(col => col.Identity)
        .ToHashSet();
        
    if (!collaborators.Contains(ctx.Sender))
        throw new Exception("not a collaborator");
        
    if (!collaborators.Contains(newAssignee))
        throw new Exception("new assignee is not a collaborator");
        
    c.Assignee = newAssignee;
    ctx.Db.card.CardId.Update(c);
}
```

### Challenge 4: Browser Tab Handling

**Problem**: Users with multiple tabs open created duplicate presence entries.

**Solution**: Track connection IDs and handle tab-specific state:

```csharp
public partial struct BoardViewer
{
    public string ConnectionId;  // Unique per tab
    // ... other fields
}

// Clean up old connections when starting new view
var existingViewers = ctx.Db.board_viewer.UserConnections
    .Filter((ctx.Sender, ctx.ConnectionId?.ToString() ?? "no-connection"))
    .ToList();
    
foreach (var viewer in existingViewers)
{
    ctx.Db.board_viewer.Delete(viewer);
}
```

## Performance Optimizations

### 1. Subscription Optimization

Instead of subscribing to all data, implemented targeted subscriptions:

```typescript
// Before: Subscribe to everything
.subscribe(['SELECT * FROM card']);

// After: Subscribe only to relevant boards
.subscribe([`
  SELECT * FROM card 
  WHERE boardId IN (
    SELECT boardId FROM collaborator 
    WHERE identity = :sender
  )
`]);
```

### 2. Batch Updates

Reduced database writes by batching related operations:

```typescript
// Collect multiple card moves in drag-and-drop
const updates: CardUpdate[] = [];
cards.forEach((card, index) => {
  if (card.position !== index) {
    updates.push({ cardId: card.cardId, position: index });
  }
});

// Single reducer call for all updates
if (updates.length > 0) {
  await conn.reducers.batchUpdateCardPositions(updates);
}
```

### 3. Memoization and Caching

Implemented computed properties with caching:

```typescript
class GlobalCardStore {
  private cardsByBoardCache = new Map<bigint, Card[]>();
  private cacheVersion = 0;
  
  getCardsForBoard(boardId: bigint): Card[] {
    const cached = this.cardsByBoardCache.get(boardId);
    if (cached && cached.version === this.cacheVersion) {
      return cached.cards;
    }
    
    const cards = this.computeCardsForBoard(boardId);
    this.cardsByBoardCache.set(boardId, { cards, version: this.cacheVersion });
    return cards;
  }
}
```

## Lessons Learned

### 1. State Management Architecture Matters

The initial approach with traditional Svelte stores led to complex update patterns and race conditions. Moving to a singleton-based architecture with Svelte 5 runes dramatically simplified the codebase and improved performance.

### 2. Server-Side Validation is Critical

Every reducer must validate permissions and data integrity. SpacetimeDB's row-level security helps, but application-level validation is still necessary:

```csharp
// Always validate:
// 1. Entity exists
// 2. User has permission
// 3. Operation is valid
// 4. Data integrity is maintained
```

### 3. Plan for Multi-Tab Scenarios

Modern web applications must handle users with multiple tabs open. This affects:
- WebSocket connections
- Presence tracking
- Local storage synchronization
- Optimistic updates

### 4. TypeScript Integration Requires Care

Generated TypeScript bindings need post-processing for optimal developer experience:
- Import path corrections
- Type augmentation for better ergonomics
- Wrapper functions for common patterns

### 5. Real-time Systems Need Careful Error Handling

Network issues, race conditions, and concurrent updates require robust error handling:

```typescript
try {
  await operation();
} catch (error) {
  if (error.message.includes('not a collaborator')) {
    // User lost access - refresh permissions
    await refreshBoardAccess();
  } else if (error.message.includes('WebSocket')) {
    // Connection issue - implement retry
    await retryWithBackoff(operation);
  }
}
```

## Future Enhancements

### Technical Improvements
1. **Offline Support**: Implement local queue for operations when disconnected
2. **Conflict Resolution**: Add CRDT-like conflict resolution for simultaneous edits
3. **Performance Monitoring**: Add metrics for operation latency and sync performance
4. **Testing Infrastructure**: Build comprehensive test suite for reducers and client logic

### Feature Additions
1. **Rich Text Cards**: Add markdown support and formatting
2. **File Attachments**: Integrate with object storage for file uploads
3. **Automation**: Add trigger-based workflows (e.g., auto-assign cards)
4. **Analytics Dashboard**: Visualize team productivity metrics
5. **Mobile App**: Build native mobile clients using the SpacetimeDB SDK

### Infrastructure Evolution
1. **Docker Deployment**: Package for easy self-hosting
2. **CI/CD Pipeline**: Automate testing and deployment
3. **Monitoring**: Add application and database monitoring
4. **Backup Strategy**: Implement automated backups and disaster recovery

## Conclusion

Building a real-time collaborative Kanban board with SpacetimeDB demonstrated the framework's strengths in handling complex, stateful applications with minimal infrastructure overhead. The journey from a basic CRUD application to a feature-rich collaboration platform revealed important patterns and practices for building modern real-time applications.

Key takeaways:
- SpacetimeDB's integrated approach significantly reduces backend complexity
- Careful state management architecture is crucial for maintainable applications
- Real-time features require thoughtful handling of edge cases
- The combination of C# modules and TypeScript clients provides excellent type safety
- Row-level security and validation must be implemented at multiple layers

The resulting application showcases how SpacetimeDB can power sophisticated collaborative applications while maintaining developer productivity and code maintainability.

---

*This case study documents the implementation as of January 2025. The codebase continues to evolve with new features and optimizations.*