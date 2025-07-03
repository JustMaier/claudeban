# Development Guide

This guide covers common development tasks and workflows for the SpacetimeDB Kanban project.

## Development Workflow

### 1. Making Server Changes

```bash
# Edit server code
vim server/domains/Cards.cs

# Rebuild and publish
spacetime publish --project-path server kanban-plus

# Generate new TypeScript bindings
cd client
spacetime generate --lang typescript --project-path ../server --out-dir src/lib/generated
```

### 2. Making Client Changes

```bash
# Start dev server with hot reload
cd client
npm run dev

# In another terminal, watch for TypeScript errors
npm run check

# Format code
npm run format
```

### 3. Testing Changes

1. Open multiple browser tabs/windows
2. Make changes in one tab
3. Verify real-time sync in others
4. Check browser console for errors
5. Monitor SpacetimeDB logs: `spacetime logs kanban-plus`

## Common Tasks

### Adding a New Table

1. Create table struct in `/server/domains/`:
```csharp
[Table(Name = "comment", Public = true)]
public partial struct Comment
{
    [PrimaryKey, AutoInc] public ulong CommentId;
    public ulong CardId;
    public Identity Author;
    public string Text;
    public Timestamp CreatedAt;
}
```

2. Add reducer for creating:
```csharp
[Reducer]
public static void AddComment(ReducerContext ctx, ulong cardId, string text)
{
    // Validate user can comment
    // Insert comment
}
```

3. Regenerate bindings and create client store

### Adding a New Reducer

1. Define in server module:
```csharp
[Reducer]
public static void ArchiveCard(ReducerContext ctx, ulong cardId)
{
    var card = ctx.Db.card.CardId.Find(cardId);
    // Validation logic
    card.State = "archived";
    ctx.Db.card.CardId.Update(card);
}
```

2. Use in client:
```typescript
await conn.reducers.archiveCard(cardId);
```

### Creating a New Store

1. Create store file in `/client/src/lib/stores/`:
```typescript
import type { Comment } from '$lib/generated';

interface CommentStore {
  comments: Comment[];
  addComment(cardId: bigint, text: string): Promise<void>;
}

export function createCommentStore(cardId: bigint): CommentStore {
  // Implementation
}
```

2. Use Svelte 5 runes for reactivity
3. Follow existing patterns in other stores

### Adding UI Components

1. Create component in `/client/src/lib/components/`
2. Use Svelte 5 syntax:
```svelte
<script lang="ts">
  interface Props {
    comment: Comment;
  }
  
  let { comment }: Props = $props();
</script>

<div class="comment">
  <!-- Component HTML -->
</div>

<style>
  /* Scoped styles */
</style>
```

## Debugging Tips

### Server Debugging

```bash
# View server logs
spacetime logs kanban-plus -f

# Check module info
spacetime info kanban-plus

# SQL console (if needed)
spacetime sql kanban-plus
```

### Client Debugging

1. **Browser DevTools**:
   - Network tab: Check WebSocket connection
   - Console: Look for SDK errors
   - Svelte DevTools: Inspect component state

2. **Add Debug Logging**:
```typescript
console.log('[StoreName]', 'Event description', data);
```

3. **Check Subscriptions**:
```typescript
$effect(() => {
  console.log('Subscription updated:', cards.length);
});
```

## Performance Considerations

### Subscription Optimization
- Only subscribe to data you need
- Use filters in subscription queries
- Unsubscribe when components unmount

### State Management
- Use `$derived` for computed values
- Avoid unnecessary effects
- Batch updates when possible

### Bundle Size
- SpacetimeDB SDK is ~200KB
- Use dynamic imports for large features
- Monitor with: `npm run build && npm run preview`

## Git Workflow

### Feature Development
```bash
# Create worktree for feature
git worktree add ../worktrees/feature-comments -b feature/comments

# Work in isolation
cd ../worktrees/feature-comments

# Commit often
git add .
git commit -m "Add comment table structure"

# Push and create PR
git push -u origin feature/comments
```

### Code Review
- Check TypeScript types
- Verify real-time sync works
- Test error cases
- Review security (especially in reducers)

## Testing Strategies

### Manual Testing Checklist
- [ ] Feature works in single tab
- [ ] Real-time sync works across tabs
- [ ] Error handling for edge cases
- [ ] Mobile responsive
- [ ] No console errors

### Load Testing
```typescript
// Simple load test
for (let i = 0; i < 100; i++) {
  await store.addCard(`Test Card ${i}`);
}
```

## Troubleshooting

### "Cannot find module" after server changes
- Regenerate bindings: `spacetime generate`
- Restart dev server

### Real-time updates not working
- Check WebSocket connection in Network tab
- Verify subscription filters
- Check server logs for errors

### Type errors in generated code
- Ensure server builds successfully
- Check for nullable types
- Regenerate with latest schema

## Resources

- [Svelte 5 Docs](https://svelte.dev/docs)
- [SpacetimeDB Docs](https://docs.spacetimedb.com)
- [Project SOPs](../TODO/README.md)
- [Current Tasks](../TODO/TRACKING/style-overhaul.md)