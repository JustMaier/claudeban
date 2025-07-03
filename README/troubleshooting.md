# Troubleshooting Guide

Common issues and their solutions when working with the SpacetimeDB Kanban project.

## Setup Issues

### "spacetime: command not found"

**Linux/Mac:**
```bash
# Check if installed
ls ~/.spacetimedb/bin/

# Add to PATH
echo 'export PATH="$HOME/.spacetimedb/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Windows:**
- Add `C:\Program Files\SpacetimeDB\bin` to System PATH
- Restart terminal

### "Node version error during npm install"

Required: Node.js 20+

**Quick fix:**
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from nodejs.org
```

### "dotnet workload install fails"

```bash
# Update .NET SDK
dotnet --version  # Should be 8.0+

# Clean and retry
dotnet workload clean
dotnet workload install wasi-experimental
```

## Runtime Issues

### "Failed to connect to SpacetimeDB"

1. Check if SpacetimeDB is running:
   ```bash
   spacetime logs kanban-plus
   ```

2. Verify correct URL in client:
   ```typescript
   // Should be ws://localhost:3000
   const DB_URI = "ws://localhost:3000/kanban-plus";
   ```

3. Check port availability:
   ```bash
   lsof -i :3000  # Linux/Mac
   netstat -ano | findstr :3000  # Windows
   ```

### "Real-time updates not working"

1. Check browser console for WebSocket errors
2. Verify subscription is active:
   ```typescript
   console.log('Subscription state:', subscription.state);
   ```
3. Check server logs for errors

### "TypeScript errors after server changes"

Always regenerate bindings after server changes:
```bash
cd client
spacetime generate --lang typescript --project-path ../server --out-dir src/lib/generated
```

### "Cards not showing up"

1. Check if you're subscribed to the correct board
2. Verify collaborator status in database
3. Look for errors in browser console
4. Check server logs for reducer errors

## Development Issues

### "Hot reload not working"

**In WSL2:**
Add to `vite.config.js`:
```javascript
server: {
  watch: {
    usePolling: true,
    interval: 100
  }
}
```

### "Git worktree errors"

```bash
# "fatal: not a git repository"
cd /path/to/main/repository
git worktree add ../worktrees/feature -b feature/name

# "branch already exists"
git worktree add ../worktrees/feature feature/existing-branch
```

### "Module build errors"

```bash
# Clean build
cd server
dotnet clean
cd ..
spacetime publish --project-path server kanban-plus --force
```

## Performance Issues

### "Application feels slow"

1. Check number of subscriptions:
   ```typescript
   console.log('Active subscriptions:', conn.subscriptions.size);
   ```

2. Profile with browser DevTools:
   - Performance tab
   - Network tab (check payload sizes)

3. Consider implementing:
   - Pagination for large lists
   - Debouncing for rapid updates
   - Virtual scrolling for many cards

### "High memory usage"

1. Check for memory leaks:
   - Unmounted components still subscribed
   - Event listeners not cleaned up
   - Large objects in closures

2. Use store cleanup:
   ```typescript
   $effect(() => {
     return () => store.cleanup();
   });
   ```

## Database Issues

### "Reducer failing silently"

Check server logs:
```bash
spacetime logs kanban-plus -f
```

Common causes:
- Validation errors
- Missing permissions
- Null reference exceptions

### "Data not persisting"

1. Verify reducer is called:
   ```typescript
   console.log('Calling reducer...');
   await conn.reducers.addCard(title);
   console.log('Reducer completed');
   ```

2. Check for transaction rollbacks in logs

### "Cannot see other users' data"

Verify collaborator status:
- User must be added as collaborator
- Check row-level security in queries
- Verify subscription filters

## Getting Help

### Before Asking for Help

1. Check browser console
2. Check server logs
3. Verify setup steps
4. Try in incognito/private mode
5. Test with minimal reproduction

### Where to Get Help

- Project issues: [GitHub Issues](https://github.com/your-repo/issues)
- SpacetimeDB help: [Discord](https://discord.gg/spacetimedb)
- Documentation: [Official Docs](https://docs.spacetimedb.com)

### Providing Good Bug Reports

Include:
- OS and version
- Node.js version
- SpacetimeDB version
- Browser and version
- Error messages (full stack trace)
- Steps to reproduce
- What you expected vs what happened