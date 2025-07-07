# Architecture Overview

This document explains how the SpacetimeDB Kanban demo is structured and how the pieces work together.

## High-Level Architecture

```
┌─────────────────┐     WebSocket      ┌──────────────────┐
│  Svelte Client  │◄──────────────────►│  SpacetimeDB     │
│   (Browser)     │                     │   (Database)     │
└─────────────────┘                     └──────────────────┘
        │                                        │
        └── Subscribes to tables ────────────────┘
            Calls reducers
            Receives updates
```

## Key Concepts

### SpacetimeDB = Database + Backend
- **No separate API server needed**
- Database runs your business logic (reducers)
- Clients connect directly via WebSocket
- Real-time subscriptions built-in

### Server Module (C#)
Located in `/server/`, written in C#, compiled to WebAssembly.

**Tables** (Data Structure):
- `User` - Identity, name, online status
- `Board` - Boards with slug, title, owner
- `Card` - Cards with state, assignee, position
- `Collaborator` - Links users to boards
- `Metric` - Performance tracking

**Reducers** (Business Logic):
- `CreateBoard` - Creates new boards
- `AddCard` - Adds cards to boards
- `UpdateCardStatus` - Moves cards between columns
- `UpdateCardPosition` - Reorders cards (drag & drop)
- Row-level security built into queries

### Client (Svelte 5)
Located in `/client/`, using Svelte 5's new runes system.

**Key Libraries**:
- `@clockworklabs/spacetimedb-sdk` - SpacetimeDB client
- Svelte 5 with runes (`$state`, `$derived`, `$effect`)
- TypeScript for type safety

**Architecture Patterns**:

1. **Reactive Stores** (`/lib/stores/`):
   ```typescript
   // Subscribes to SpacetimeDB tables
   // Manages local state cache
   // Provides reactive updates to UI
   ```

2. **Generated Bindings** (`/lib/generated/`):
   ```typescript
   // Auto-generated from server schema
   // Type-safe table interfaces
   // Reducer function calls
   ```

3. **Component Hierarchy**:
   ```
   App.svelte
   ├── ConnectionInitializer (WebSocket setup)
   ├── AppShell
   │   ├── UserProfile
   │   ├── BoardList
   │   └── BoardView
   │       └── KanbanBoard
   │           └── CardColumn
   │               └── CardItem
   ```

## Data Flow

### 1. Initial Connection
```typescript
// Client connects to SpacetimeDB
connect(uri, auth_token) 
  → onConnect: creates/updates User
  → subscribes to tables with filters
  → receives initial data
```

### 2. User Action Example (Creating a Card)
```
User types → CardInput component
  → calls cardStore.addCard()
  → SDK calls reducer on server
  → Server validates & inserts
  → All subscribed clients receive update
  → UI reactively updates
```

### 3. Real-time Sync
- Every database change broadcasts to subscribers
- Clients with matching subscription filters get updates
- Svelte stores trigger UI re-renders automatically
- No polling, no manual refreshing

## Security Model

### Identity System
- Each client gets a unique `Identity` on connection
- Identity persists across sessions with auth token
- All reducer calls include sender's identity

### Row-Level Security
```csharp
// Only see boards you collaborate on
ctx.Db.board.Iter()
  .Where(b => ctx.Db.collaborator.Iter()
  .Any(c => c.BoardId == b.BoardId && c.Identity == ctx.Sender))
```

## Performance Optimizations

### Subscription Management
- `StoreRegistry` pattern prevents duplicate subscriptions
- Reference counting for cleanup
- Lazy loading boards only when viewed

### Activity Tracking
- Separate activity tracking to avoid main data pollution
- Smart unread counts without querying all cards
- Client-side caching of activity state

## File Structure Explained

```
/server/
├── StdbModule.csproj    # .NET project file
├── global.json          # .NET SDK version
└── domains/            
    ├── Users.cs         # User table & auth
    ├── Boards.cs        # Board management
    ├── Cards.cs         # Card CRUD
    └── Metrics.cs       # Analytics

/client/
├── src/
│   ├── lib/
│   │   ├── generated/   # Auto-generated from server
│   │   ├── stores/      # Reactive state management
│   │   ├── components/  # UI components
│   │   └── utils/       # Helper functions
│   └── routes/          # SvelteKit pages
└── vite.config.ts       # Build configuration
```

## Adding Features

1. **Server Side**: Add table or reducer in `/server/domains/`
2. **Generate Bindings**: `spacetime generate`
3. **Client Store**: Create/update store in `/lib/stores/`
4. **UI Component**: Build component using store
5. **Test**: Real-time sync should "just work"

## Learn More

- [SpacetimeDB Concepts](spacetimedb-intro.md)
- [Development Guide](development.md)
- [Official SpacetimeDB Docs](https://docs.spacetimedb.com)