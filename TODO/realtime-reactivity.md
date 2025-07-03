# SpacetimeDB Kanban Real-time Reactivity Features

## Overview
Enhance the Kanban app with real-time activity tracking, improved status badges, and live presence indicators to create a dynamic, collaborative experience.

## Current State
- Global stores for cards and collaborators
- Basic activity tracking with unread counts
- Board switching works with instant data loading
- Activity badges show new cards and completed tasks

## Phase 1: Enhanced Status Badges (1 Agent)

### 1.1 Replace Activity Badges with Status Counts
Instead of showing unread/completed counts, display actual card distribution:

**Visual Design**
- 🔵 Blue badge: Number of "todo" cards
- 🟡 Yellow badge: Number of "in_progress" cards  
- 🟢 Green badge: Number of "done" cards
- Show only non-zero counts
- Subtle animations on count changes

**Implementation**
```typescript
interface BoardActivity {
  boardId: bigint;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  totalCount: number;
  lastUpdate: Date | null;
  hasActivity: boolean;
}
```

### 1.2 Activity Store Updates
- Modify `getBoardActivity()` to calculate status counts
- Remove unread/completed tracking (or make it secondary)
- Add method `getStatusCounts(boardId)` for efficiency

### 1.3 BoardList Component Updates
```svelte
<span class="status-badges">
  {#if activity.todoCount > 0}
    <span class="badge todo" title="{activity.todoCount} to do">
      {activity.todoCount}
    </span>
  {/if}
  {#if activity.inProgressCount > 0}
    <span class="badge in-progress" title="{activity.inProgressCount} in progress">
      {activity.inProgressCount}
    </span>
  {/if}
  {#if activity.doneCount > 0}
    <span class="badge done" title="{activity.doneCount} done">
      {activity.doneCount}
    </span>
  {/if}
</span>
```

## Phase 2: Live Presence Infrastructure (2 Agents Parallel)

### Agent A: Server-Side Presence Tracking

#### 2.1 Database Schema
```csharp
[Table(Name = "board_viewer", Public = true)]
[SpacetimeDB.Index.BTree(Name = "BoardViewers", Columns = [nameof(BoardId)])]
[SpacetimeDB.Index.BTree(Name = "UserConnections", Columns = [nameof(Identity), nameof(ConnectionId)])]
public partial struct BoardViewer
{
    public ulong BoardId;
    public Identity Identity;
    public string ConnectionId;  // Handle multiple tabs
    public Timestamp LastPing;
    public string? UserAgent;    // Optional: Track device type
}
```

#### 2.2 Reducers
```csharp
[Reducer]
public static void StartViewingBoard(ReducerContext ctx, ulong boardId)
{
    // Validate user is collaborator
    var isCollaborator = ctx.Db.collaborator.BoardIdentity
        .Filter((boardId, ctx.Sender)).Any();
    
    if (!isCollaborator)
        throw new Exception("Not authorized to view this board");
    
    // Add viewer entry
    ctx.Db.board_viewer.Insert(new BoardViewer {
        BoardId = boardId,
        Identity = ctx.Sender,
        ConnectionId = ctx.ConnectionId,
        LastPing = ctx.Timestamp,
        UserAgent = ctx.UserAgent // If available
    });
}

[Reducer]
public static void StopViewingBoard(ReducerContext ctx, ulong boardId)
{
    // Remove specific connection
    var viewers = ctx.Db.board_viewer.UserConnections
        .Filter((ctx.Sender, ctx.ConnectionId));
    
    foreach (var viewer in viewers)
    {
        if (viewer.BoardId == boardId)
            ctx.Db.board_viewer.Delete(viewer);
    }
}

[Reducer]
public static void PingBoardView(ReducerContext ctx, ulong boardId)
{
    // Update LastPing for keepalive
    var viewer = ctx.Db.board_viewer.UserConnections
        .Filter((ctx.Sender, ctx.ConnectionId))
        .FirstOrDefault(v => v.BoardId == boardId);
    
    if (viewer != null)
    {
        viewer.LastPing = ctx.Timestamp;
        ctx.Db.board_viewer.Update(viewer);
    }
}
```

#### 2.3 Cleanup Logic
Modify `ClientDisconnect` to remove stale viewers:
```csharp
// In ClientDisconnect reducer
var viewers = ctx.Db.board_viewer.UserConnections
    .Filter((ctx.Sender, ctx.ConnectionId));

foreach (var viewer in viewers)
    ctx.Db.board_viewer.Delete(viewer);
```

Add scheduled cleanup for stale pings (> 1 minute old).

### Agent B: Client-Side Presence System

#### 2.4 Board Viewer Store
Create `board-viewer-store.svelte.ts`:
```typescript
interface BoardViewerData {
  viewers: Map<string, BoardViewer>; // keyed by Identity hex
  lastUpdate: Date;
}

class GlobalBoardViewerStore {
  private viewersByBoard = $state<Map<bigint, BoardViewerData>>(new Map());
  private currentViewing = $state<Map<bigint, string>>(new Map()); // boardId -> connectionId
  
  getViewersForBoard(boardId: bigint): BoardViewer[] {
    const data = this.viewersByBoard.get(boardId);
    return data ? Array.from(data.viewers.values()) : [];
  }
  
  getActiveViewerCount(boardId: bigint): number {
    return this.getViewersForBoard(boardId).length;
  }
  
  getViewerUsers(boardId: bigint): Identity[] {
    // Get unique users (may have multiple tabs)
    const viewers = this.getViewersForBoard(boardId);
    const uniqueUsers = new Map<string, Identity>();
    
    viewers.forEach(v => {
      uniqueUsers.set(v.identity.toHexString(), v.identity);
    });
    
    return Array.from(uniqueUsers.values());
  }
  
  async startViewing(boardId: bigint) {
    const { conn } = getConnection();
    await conn.reducers.startViewingBoard(boardId);
    
    // Track locally for cleanup
    this.currentViewing.set(boardId, conn.connectionId);
    
    // Start ping interval
    const interval = setInterval(() => {
      conn.reducers.pingBoardView(boardId);
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(interval);
      this.stopViewing(boardId);
    };
  }
  
  async stopViewing(boardId: bigint) {
    const { conn } = getConnection();
    await conn.reducers.stopViewingBoard(boardId);
    this.currentViewing.delete(boardId);
  }
}
```

#### 2.5 Presence Hook
```typescript
export function useBoardPresence(boardId: bigint) {
  const viewerStore = useGlobalBoardViewerStore();
  
  $effect(() => {
    // Start viewing this board
    const cleanup = viewerStore.startViewing(boardId);
    
    // Stop viewing when component unmounts or boardId changes
    return cleanup;
  });
  
  const viewers = $derived(viewerStore.getViewerUsers(boardId));
  const viewerCount = $derived(viewerStore.getActiveViewerCount(boardId));
  
  return { viewers, viewerCount };
}
```

## Phase 3: UI Integration (2 Agents Parallel)

### Agent A: Board List Presence

#### 3.1 Update BoardList Component
```svelte
{#each boardStore.boards as board}
  {@const activity = getBoardActivity(board.boardId)}
  {@const viewers = viewerStore.getViewerUsers(board.boardId)}
  <li class:selected={board.boardId === boardStore.activeBoard}>
    <button onclick={() => boardStore.setActiveBoard(board.boardId)}>
      <span class="board-name">{board.title}</span>
      
      <span class="board-indicators">
        <!-- Status badges -->
        <span class="status-badges">
          <!-- ... status count badges ... -->
        </span>
        
        <!-- Active viewers -->
        {#if viewers.length > 0}
          <span class="viewers" title="{viewers.length} viewing">
            {#if viewers.length <= 3}
              {#each viewers as viewerId}
                {@const user = userStore.getUserById(viewerId)}
                <span class="viewer-initial">
                  {user?.name?.[0] || '?'}
                </span>
              {/each}
            {:else}
              <span class="viewer-count">👁️ {viewers.length}</span>
            {/if}
          </span>
        {/if}
      </span>
    </button>
  </li>
{/each}
```

#### 3.2 Styling
```css
.viewers {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 0.5rem;
}

.viewer-initial {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.viewer-count {
  font-size: 0.875rem;
  color: #6366f1;
}

/* Pulse animation for live viewers */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.viewers {
  animation: pulse 2s ease-in-out infinite;
}
```

### Agent B: Board View Presence

#### 3.3 Update KanbanBoard Component
```svelte
<script>
  const { viewers, viewerCount } = useBoardPresence(boardId);
</script>

<!-- Add presence indicator to board header -->
{#if viewerCount > 0}
  <div class="active-viewers">
    <span class="viewer-label">Currently viewing:</span>
    {#each viewers.slice(0, 5) as viewerId}
      {@const user = userStore.getUserById(viewerId)}
      <UserAvatar {user} size="sm" showOnlineIndicator />
    {/each}
    {#if viewers.length > 5}
      <span class="more-viewers">+{viewers.length - 5} more</span>
    {/if}
  </div>
{/if}
```

## Phase 4: Real-time Enhancements (3 Agents Parallel)

### Agent A: Live Card Updates Animation
- Animate card additions/removals
- Highlight recently modified cards
- Show who's editing a card (future feature)

### Agent B: Presence Cursor (Future)
Create TODO/presence-cursors.md:
- Track mouse position per user
- Show colored cursors on board
- Requires WebRTC or frequent position updates

### Agent C: Activity Feed
Create TODO/activity-feed.md:
- Real-time feed of board actions
- "John moved 'Fix bug' to In Progress"
- Collapsible sidebar component

## Implementation Order

1. **Phase 1** - Enhanced Status Badges (Quick win, improves UX immediately)
2. **Phase 2A & 2B** - Presence tracking (Server and client in parallel)
3. **Phase 3A & 3B** - UI integration (Board list and view in parallel)
4. **Phase 4** - Additional enhancements (Can be done independently)

## Technical Considerations

### Performance
- Presence pings every 30 seconds to reduce load
- Cleanup stale connections after 1 minute
- Consider batching presence updates
- Use requestAnimationFrame for animations

### Scalability
- Index BoardViewer table by BoardId for fast queries
- Consider pagination for boards with many viewers
- Implement connection pooling for presence updates

### Edge Cases
- Handle multiple tabs per user gracefully
- Clean up on browser crash/network loss
- Throttle rapid board switching
- Handle permission changes (user removed as collaborator)

## Success Metrics
- Status badges update in real-time
- Presence indicators show active users
- < 100ms latency for presence updates
- Graceful degradation on connection issues
- Mobile-friendly presence indicators

## Future Enhancements
1. **Typing Indicators** - Show who's creating a card
2. **Focus Mode** - Hide presence when user wants privacy
3. **Presence History** - "Last viewed 2 hours ago"
4. **Team Heatmap** - Visualize team activity patterns
5. **Smart Notifications** - "3 people are viewing your board"
6. **Collaborative Editing** - Multiple users edit same card
7. **Voice Chat Integration** - For active board viewers
8. **Screen Sharing** - Share board view with team

## Questions to Resolve
1. Should presence persist across page refreshes?
2. How long before marking a user as "idle"?
3. Should we show device type (mobile/desktop)?
4. Privacy settings for presence visibility?
5. Rate limiting for presence updates?